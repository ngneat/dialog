import {
  Injectable,
  Type,
  TemplateRef,
  Inject,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ViewRef,
  ComponentRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { nanoid } from 'nanoid';

import { DialogRef } from './dialog-ref';
import { DialogComponent, DIALOG_CONFIG, VIEW_TO_INSERT, DIALOG_DATA } from './dialog.component';
import { DialogConfig } from './config';

@Injectable({ providedIn: 'root' })
export class DialogService {
  public dialogs: DialogRef[] = [];

  private dialogFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

  constructor(
    private appRef: ApplicationRef,
    @Inject(DOCUMENT) private document: Document,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  open<D, T = any>(template: TemplateRef<T>, config?: Partial<DialogConfig<D>>): DialogRef<D, TemplateRef<T>>;
  open<D, T = any>(component: Type<T>, config?: Partial<DialogConfig<D>>): DialogRef<D, ComponentRef<T>>;
  open(componentOrTemplate: Type<any> | TemplateRef<any>, config: Partial<DialogConfig> = {}): DialogRef {
    return componentOrTemplate instanceof TemplateRef
      ? this.openTemplate(componentOrTemplate, config)
      : typeof componentOrTemplate === 'function'
      ? this.openComponent(componentOrTemplate, config)
      : this.throwMustBeAComponentOrATemplateRef(componentOrTemplate);
  }

  private openComponent(component: Type<any>, config: Partial<DialogConfig>) {
    const dialogRef = new DialogRef();

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
        parent: this.injector
      })
    );

    return this.attach(dialogRef, componentRef, componentRef.hostView, this.mergeConfig(config));
  }

  private openTemplate(template: TemplateRef<any>, config: Partial<DialogConfig>) {
    const dialogRef = new DialogRef();

    const view = template.createEmbeddedView({
      $implicit: dialogRef,
      data: config.data
    });

    return this.attach(dialogRef, template, view, this.mergeConfig(config));
  }

  private attach<Ref extends ComponentRef<any> | TemplateRef<any>>(
    dialogRef: DialogRef,
    ref: Ref,
    view: ViewRef,
    config: DialogConfig
  ) {
    const dialog = this.createDialog(config, dialogRef, view);

    const hooks = {
      before: new Subject<() => void>(),
      after: new Subject<void>()
    };

    hooks.before.subscribe({
      complete: () => {
        this.dialogs = this.dialogs.filter(({ id }) => dialogRef.id !== id);

        config.container.removeChild(dialog.location.nativeElement);
        this.appRef.detachView(dialog.hostView);

        dialog.destroy();
        view.destroy();

        this.cleanDialogRef(dialogRef);

        hooks.after.next();
        hooks.after.complete();
      }
    });

    const dispose = () => {
      let canceled = false;
      const cancel = () => (canceled = true);

      hooks.before.next(cancel);

      if (canceled) {
        return;
      }

      hooks.before.complete();
    };

    this.mutateDialogRef(dialogRef, {
      id: config.id,
      ref,
      dispose,
      data: config.data,
      beforeClose$: hooks.before,
      afterClosed$: hooks.after
    });
    this.dialogs.push(dialogRef);

    config.container.appendChild(dialog.location.nativeElement);
    this.appRef.attachView(dialog.hostView);

    return dialogRef;
  }

  private mergeConfig(config: Partial<DialogConfig>): DialogConfig {
    const defaultConfig: DialogConfig = {
      id: nanoid(),
      container: this.document.body,
      backdrop: true,
      windowClass: null,
      enableClose: true,
      size: 'small',
      width: null,
      height: null,
      draggable: false,
      fullScreen: false,
      data: null
    };

    return {
      ...defaultConfig,
      ...Object.entries(config).reduce((cleanConfig, [key, value]) => {
        if (value != null) {
          cleanConfig[key] = value;
        }
        return cleanConfig;
      }, {})
    };
  }

  private createDialog(config: DialogConfig, dialogRef: DialogRef, view: ViewRef) {
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
            provide: VIEW_TO_INSERT,
            useValue: view
          }
        ],
        parent: this.injector
      })
    );
  }

  private throwMustBeAComponentOrATemplateRef(value: unknown): never {
    throw new Error(`${value} must be a Component or a TemplateRef`);
  }

  private mutateDialogRef(dialogRef: DialogRef, props: Partial<DialogRef>) {
    Object.assign(dialogRef, props);
  }

  private cleanDialogRef(dialogRef: DialogRef): void {
    Object.keys(dialogRef).forEach(key => (dialogRef[key] = null));
  }
}
