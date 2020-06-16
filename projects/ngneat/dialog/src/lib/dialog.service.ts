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
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { nanoid } from 'nanoid';

import { DialogRef, InternalDialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DialogConfig } from './config';
import { DIALOG_CONFIG, DIALOG_DATA, NODES_TO_INSERT } from './tokens';

@Injectable({ providedIn: 'root' })
export class DialogService {
  public dialogs: DialogRef[] = [];

  private dialogFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

  private defaultConfig: DialogConfig = {
    id: nanoid(),
    container: this.document.body,
    backdrop: true,
    enableClose: true,
    draggable: false,
    fullScreen: false,
    resizable: false,
    size: 'sm',
    windowClass: undefined,
    sizes: undefined,
    width: undefined,
    height: undefined,
    data: undefined,
    vcr: undefined
  };

  constructor(
    private appRef: ApplicationRef,
    @Inject(DOCUMENT)
    private document: Document,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DIALOG_CONFIG)
    private sizes: DialogConfig['sizes']
  ) {}

  open<D, R = any, T = any>(
    template: TemplateRef<T>,
    config?: Partial<DialogConfig<D>>
  ): DialogRef<D, R, TemplateRef<T>>;
  open<D, R = any, T = any>(component: Type<T>, config?: Partial<DialogConfig<D>>): DialogRef<D, R, ComponentRef<T>>;
  open(componentOrTemplate: Type<any> | TemplateRef<any>, config: Partial<DialogConfig> = {}): DialogRef {
    return componentOrTemplate instanceof TemplateRef
      ? this.openTemplate(componentOrTemplate, this.mergeConfig(config))
      : typeof componentOrTemplate === 'function'
      ? this.openComponent(componentOrTemplate, this.mergeConfig(config))
      : this.throwMustBeAComponentOrATemplateRef(componentOrTemplate);
  }

  private openTemplate(template: TemplateRef<any>, config: DialogConfig) {
    const dialogRef = new InternalDialogRef();

    const context = {
      $implicit: dialogRef,
      data: config.data
    };

    const view = config.vcr?.createEmbeddedView(template, context) || template.createEmbeddedView(context);

    return this.attach(dialogRef, template, view, config);
  }

  private openComponent(component: Type<any>, config: DialogConfig) {
    const dialogRef = new InternalDialogRef();

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
  ) {
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

  private mergeConfig(config: Partial<DialogConfig>): DialogConfig {
    return {
      ...this.defaultConfig,
      ...{ sizes: this.sizes },
      ...Object.entries(config).reduce((cleanConfig, [key, value]) => {
        if (value != null) {
          cleanConfig[key] = value;
        }
        return cleanConfig;
      }, {})
    };
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

  private throwMustBeAComponentOrATemplateRef(value: unknown): never {
    throw new TypeError(`Dialog must receive a Component or a TemplateRef, but this has been passed instead: ${value}`);
  }
}
