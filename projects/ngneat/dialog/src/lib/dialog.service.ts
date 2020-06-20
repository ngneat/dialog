import {
  Injectable,
  Type,
  TemplateRef,
  Inject,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { nanoid } from 'nanoid';

import { DialogRef, InternalDialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DialogConfig, GlobalDialogConfig } from './config';
import { DIALOG_CONFIG, DIALOG_DATA, NODES_TO_INSERT, GLOBAL_DIALOG_CONFIG } from './tokens';
import {
  DialogContent,
  DialogContentSymbol,
  DialogTitleAndBody,
  DialogContentTypes as DialogContentType
} from './types';

interface OpenParams {
  config: DialogConfig;
  dialogRef: InternalDialogRef;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  public dialogs: DialogRef[] = [];

  private dialogFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DIALOG_CONFIG)
    private defaultConfig: DialogConfig,
    @Inject(GLOBAL_DIALOG_CONFIG)
    private globalConfig: GlobalDialogConfig
  ) {}

  success<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, void, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(config, content);

    return this.open(configWithDefaults.success.component, configWithDefaults);
  }

  confirm<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, boolean, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(config, content);

    return this.open(configWithDefaults.confirm.component, configWithDefaults);
  }

  error<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, void, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(config, content);

    return this.open(configWithDefaults.error.component, configWithDefaults);
  }

  open<D, R = any, T = any>(
    template: TemplateRef<T>,
    config?: Partial<DialogConfig<D>>
  ): DialogRef<D, R, TemplateRef<T>>;
  open<D, R = any, T = any>(component: Type<T>, config?: Partial<DialogConfig<D>>): DialogRef<D, R, ComponentRef<T>>;
  open(componentOrTemplate: Type<any> | TemplateRef<any>, config: Partial<DialogConfig> = {}): DialogRef {
    const configWithDefaults = this.mergeConfig(config);
    const dialogRef = new InternalDialogRef({
      id: configWithDefaults.id,
      data: configWithDefaults.data
    });
    const params: OpenParams = {
      config: configWithDefaults,
      dialogRef
    };

    return componentOrTemplate instanceof TemplateRef
      ? this.openTemplate(componentOrTemplate, params)
      : typeof componentOrTemplate === 'function'
      ? this.openComponent(componentOrTemplate, params)
      : this.throwMustBeAComponentOrATemplateRef(componentOrTemplate);
  }

  private openTemplate(template: TemplateRef<any>, { config, dialogRef }: OpenParams) {
    const context = {
      $implicit: dialogRef,
      data: config.data
    };

    const view = config.vcr?.createEmbeddedView(template, context) || template.createEmbeddedView(context);

    return this.attach(dialogRef, template, view, config);
  }

  private openComponent(component: Type<any>, { config, dialogRef }: OpenParams) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = factory.create(
      Injector.create({
        providers: [
          {
            provide: DialogRef,
            useValue: dialogRef
          },
          {
            provide: DIALOG_DATA,
            useValue: config.data
          }
        ],
        parent: config.vcr?.injector || this.injector
      })
    );

    this.appRef.attachView(componentRef.hostView);

    return this.attach(dialogRef, componentRef, componentRef.hostView as EmbeddedViewRef<any>, config);
  }

  private attach<Ref extends ComponentRef<any> | TemplateRef<any>>(
    dialogRef: InternalDialogRef,
    ref: Ref,
    view: EmbeddedViewRef<any>,
    config: DialogConfig
  ): DialogRef<any, any, any> {
    const dialog = this.createDialog(config, dialogRef, view);
    const container = config.container instanceof ElementRef ? config.container.nativeElement : config.container;

    const hooks = {
      after: new Subject<unknown>()
    };

    const onClose = (result: unknown) => {
      this.dialogs = this.dialogs.filter(({ id }) => dialogRef.id !== id);

      container.removeChild(dialog.location.nativeElement);
      this.appRef.detachView(dialog.hostView);
      this.appRef.detachView(view);

      dialog.destroy();
      view.destroy();

      dialogRef.mutate({
        ref: null,
        onClose: null,
        afterClosed$: null,
        backdropClick$: null,
        beforeCloseGuards: null
      });

      hooks.after.next(result);
      hooks.after.complete();
    };

    dialogRef.mutate({
      id: config.id,
      data: config.data,
      ref,
      onClose,
      afterClosed$: hooks.after.asObservable()
    });
    this.dialogs.push(dialogRef);

    container.appendChild(dialog.location.nativeElement);
    this.appRef.attachView(dialog.hostView);

    return dialogRef.asDialogRef();
  }

  private createDialog(config: DialogConfig, dialogRef: DialogRef, view: EmbeddedViewRef<any>) {
    return this.dialogFactory.create(
      Injector.create({
        providers: [
          {
            provide: DialogRef,
            useValue: dialogRef
          },
          {
            provide: DIALOG_CONFIG,
            useValue: config
          },
          {
            provide: NODES_TO_INSERT,
            useValue: view.rootNodes
          }
        ],
        parent: this.injector
      })
    );
  }

  private mergeConfig(config: Partial<DialogConfig>): DialogConfig {
    return {
      id: nanoid(),
      ...this.defaultConfig,
      ...this.globalConfig,
      ...Object.entries(config).reduce((cleanConfig, [key, value]) => {
        if (value != null) {
          cleanConfig[key] = value;
        }
        return cleanConfig;
      }, {})
    };
  }

  private mergeConfigWithContent(config: Partial<DialogConfig>, content: DialogContent | DialogTitleAndBody) {
    const { data, ...configWithDefaults } = this.mergeConfig(config);

    return {
      ...configWithDefaults,
      data: {
        ...data,
        [DialogContentSymbol]: this.isTemplateOrString(content)
          ? {
              title: null,
              body: {
                type: this.getTypeOfContent(content),
                content
              }
            }
          : Object.entries(content).reduce((acc, [key, value]) => {
              acc[key] = {
                type: this.getTypeOfContent(value),
                content: value
              };

              return acc;
            }, {})
      }
    };
  }

  private isTemplateOrString(content: DialogContent | DialogTitleAndBody): content is DialogContent {
    return content instanceof TemplateRef || typeof content === 'string';
  }

  private getTypeOfContent(content: DialogContent): DialogContentType {
    return content instanceof TemplateRef ? 'template' : 'string';
  }

  private throwMustBeAComponentOrATemplateRef(value: unknown): never {
    throw new TypeError(`Dialog must receive a Component or a TemplateRef, but this has been passed instead: ${value}`);
  }
}
