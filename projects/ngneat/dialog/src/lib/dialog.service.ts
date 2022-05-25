import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Inject,
  Injectable,
  Injector,
  TemplateRef,
  Type
} from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig, GlobalDialogConfig } from './config';
import { DialogRef, InternalDialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DIALOG_CONFIG, DIALOG_DOCUMENT_REF, GLOBAL_DIALOG_CONFIG, NODES_TO_INSERT } from './tokens';
import {
  ComputedDialogRefType,
  DialogContent,
  DialogContentSymbol,
  DialogContentTypes as DialogContentType,
  DialogTitleAndBody,
  ExtractDialogRefData,
  ExtractDialogRefResult,
  ExtractDialogResolvedRef
} from './types';

interface OpenParams {
  config: DialogConfig;
  dialogRef: InternalDialogRef;
}

interface AttachOptions {
  dialogRef: InternalDialogRef;
  ref: ComponentRef<any> | TemplateRef<any>;
  view: EmbeddedViewRef<any>;
  attachToApp: boolean;
  config: DialogConfig;
}

const OVERFLOW_HIDDEN_CLASS = 'ngneat-dialog-hidden';

@Injectable({ providedIn: 'root' })
export class DialogService {
  public dialogs: DialogRef[] = [];

  private dialogFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DIALOG_DOCUMENT_REF) private document,
    @Inject(DIALOG_CONFIG)
    private defaultConfig: DialogConfig,
    @Inject(GLOBAL_DIALOG_CONFIG)
    private globalConfig: GlobalDialogConfig
  ) {}

  closeAll() {
    this.dialogs.forEach(dialog => dialog.close());
  }

  success<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, void, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(this.applyDefaultSize<D>(config), content);

    return this.open(configWithDefaults.success.component, configWithDefaults);
  }

  confirm<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, boolean, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(this.applyDefaultSize<D>(config), content);

    return this.open(configWithDefaults.confirm.component, configWithDefaults);
  }

  error<D>(
    content: DialogContent | DialogTitleAndBody,
    config: Partial<DialogConfig<D>> = {}
  ): DialogRef<D, void, ComponentRef<any>> {
    const configWithDefaults = this.mergeConfigWithContent(this.applyDefaultSize<D>(config), content);

    return this.open(configWithDefaults.error.component, configWithDefaults);
  }

  open<
    TData extends ExtractDialogRefData<ComputedDialogRefType<T>>,
    TResult extends ExtractDialogRefResult<ComputedDialogRefType<T>>,
    T extends Type<any> | TemplateRef<any> = Type<any> | TemplateRef<any>,
    TDialogRef extends DialogRef<any, any, any> = DialogRef<TData, TResult, ComputedDialogRefType<T>>
  >(componentOrTemplate: T, config: Partial<DialogConfig<TData>> = {}): TDialogRef {
    const configWithDefaults = this.mergeConfig(config);
    configWithDefaults.onOpen?.();
    const dialogRef = new InternalDialogRef({
      id: configWithDefaults.id,
      data: configWithDefaults.data,
      backdropClick$: new Subject<MouseEvent>()
    });
    const params: OpenParams = {
      config: configWithDefaults,
      dialogRef
    };

    this.throwIfIDAlreadyExists(configWithDefaults.id);

    this.dialogs.push(dialogRef);
    if (this.dialogs.length === 1) {
      this.document.body.classList.add(OVERFLOW_HIDDEN_CLASS);
    }

    return componentOrTemplate instanceof TemplateRef
      ? (this.openTemplate(componentOrTemplate, params) as TDialogRef)
      : typeof componentOrTemplate === 'function'
      ? (this.openComponent(componentOrTemplate, params) as TDialogRef)
      : this.throwMustBeAComponentOrATemplateRef(componentOrTemplate);
  }

  private openTemplate(template: TemplateRef<any>, { config, dialogRef }: OpenParams) {
    const context = {
      $implicit: dialogRef,
      config
    };

    const view = config.vcr?.createEmbeddedView(template, context) || template.createEmbeddedView(context);

    return this.attach({
      dialogRef,
      config,
      ref: template,
      view,
      attachToApp: !config.vcr
    });
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
            provide: DIALOG_CONFIG,
            useValue: config
          }
        ],
        parent: config.vcr?.injector || this.injector
      })
    );

    return this.attach({
      dialogRef,
      config,
      ref: componentRef,
      view: componentRef.hostView as EmbeddedViewRef<any>,
      attachToApp: true
    });
  }

  private attach({ dialogRef, config, ref, view, attachToApp }: AttachOptions): DialogRef<any, any, any> {
    const dialog = this.createDialog(config, dialogRef, view);
    const container = config.container instanceof ElementRef ? config.container.nativeElement : config.container;

    const hooks = {
      after: new Subject<unknown>()
    };

    const onClose = (result: unknown) => {
      this.globalConfig.onClose?.();
      this.dialogs = this.dialogs.filter(({ id }) => dialogRef.id !== id);

      container.removeChild(dialog.location.nativeElement);
      this.appRef.detachView(dialog.hostView);
      this.appRef.detachView(view);

      dialog.destroy();
      view.destroy();

      dialogRef.backdropClick$.complete();

      dialogRef.mutate({
        ref: null,
        onClose: null,
        afterClosed$: null,
        backdropClick$: null,
        beforeCloseGuards: null,
        onReset: null
      });

      hooks.after.next(result);
      hooks.after.complete();
      if (this.dialogs.length === 0) {
        this.document.body.classList.remove(OVERFLOW_HIDDEN_CLASS);
      }
    };

    const onReset = () => {
      dialog.instance.reset();
    };

    dialogRef.mutate({
      id: config.id,
      data: config.data,
      ref,
      onClose,
      afterClosed$: hooks.after.asObservable(),
      onReset
    });

    container.appendChild(dialog.location.nativeElement);
    this.appRef.attachView(dialog.hostView);

    if (attachToApp) {
      this.appRef.attachView(view);
    }

    return dialogRef.asDialogRef();
  }

  private createDialog(config: DialogConfig, dialogRef: InternalDialogRef, view: EmbeddedViewRef<any>) {
    return this.dialogFactory.create(
      Injector.create({
        providers: [
          {
            provide: InternalDialogRef,
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
      ...this.defaultConfig,
      id: nanoid(),
      ...this.globalConfig,
      ...this.cleanConfig(config),
      sizes: {
        ...this.defaultConfig.sizes,
        ...this.globalConfig?.sizes,
        ...config?.sizes
      }
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

  private cleanConfig(config: Partial<DialogConfig>) {
    return Object.entries(config).reduce((cleanConfig, [key, value]) => {
      if (value != null) {
        cleanConfig[key] = value;
      }
      return cleanConfig;
    }, {});
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

  private throwIfIDAlreadyExists(id: string) {
    if (this.dialogs.find(dialog => dialog.id === id)) {
      throw new Error(`Please, ID must be unique, but there is already a dialog created with this ID: ${id}`);
    }
  }

  private applyDefaultSize<D>(config: Partial<DialogConfig<D>>): Partial<DialogConfig<D>> {
    return {
      ...config,
      size: config.size || 'sm'
    };
  }
}

function nanoid() {
  return `dialog-${Math.random()
    .toString(36)
    .substring(7)}`;
}
