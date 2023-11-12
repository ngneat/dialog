import {
  ApplicationRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  TemplateRef,
  Type,
  ViewRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DialogRef, InternalDialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DragOffset } from './draggable.directive';
import { DIALOG_CONFIG, DIALOG_DOCUMENT_REF, GLOBAL_DIALOG_CONFIG, NODES_TO_INSERT } from './providers';
import { AttachOptions, DialogConfig, ExtractData, ExtractResult, GlobalDialogConfig, OpenParams } from './types';

const OVERFLOW_HIDDEN_CLASS = 'ngneat-dialog-hidden';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private document = inject(DIALOG_DOCUMENT_REF);
  private globalConfig = inject(GLOBAL_DIALOG_CONFIG);

  // Replace with Map in next major version
  dialogs: DialogRef[] = [];
  // A Stream representing opening & closing dialogs
  private hasOpenDialogSub = new BehaviorSubject<boolean>(false);
  hasOpenDialogs$ = this.hasOpenDialogSub.asObservable();

  hasOpenDialogs() {
    return this.dialogs.length > 0;
  }

  isOpen(id: string) {
    return this.dialogs.some((ref) => ref.id === id);
  }

  isLastOpened(idOrRef: string | DialogRef): boolean {
    const id = idOrRef instanceof DialogRef ? idOrRef.id : idOrRef;

    return this.dialogs.at(-1)?.id === id;
  }

  closeAll() {
    this.dialogs.forEach((dialog) => dialog.close());
  }

  open(template: TemplateRef<any>, config?: Partial<DialogConfig>): DialogRef;
  open<C extends Type<any>>(
    component: C,
    config?: Partial<DialogConfig<ExtractData<InstanceType<C>>>>,
  ): DialogRef<ExtractData<InstanceType<C>>, ExtractResult<InstanceType<C>>>;
  open(componentOrTemplate: any, config: Partial<DialogConfig> = {}): DialogRef {
    const mergedConfig = this.mergeConfig(config);
    if (this.isOpen(mergedConfig.id)) {
      return;
    }

    mergedConfig.onOpen?.();

    const dialogRef = new InternalDialogRef({
      id: mergedConfig.id,
      data: mergedConfig.data,
      backdropClick$: new Subject<MouseEvent>(),
    });

    const params: OpenParams = {
      config: mergedConfig,
      dialogRef,
    };

    this.dialogs.push(dialogRef);
    this.hasOpenDialogSub.next(true);

    if (this.dialogs.length === 1) {
      this.document.body.classList.add(OVERFLOW_HIDDEN_CLASS);
    }

    return componentOrTemplate instanceof TemplateRef
      ? this.openTemplate(componentOrTemplate, params)
      : typeof componentOrTemplate === 'function'
      ? this.openComponent(componentOrTemplate, params)
      : throwMustBeAComponentOrATemplateRef(componentOrTemplate);
  }

  private openTemplate(template: TemplateRef<any>, { config, dialogRef }: OpenParams) {
    const context = {
      $implicit: dialogRef,
      config,
    };

    const view = config.vcr?.createEmbeddedView(template, context) || template.createEmbeddedView(context);

    return this.attach({
      dialogRef,
      config,
      ref: template,
      view,
      attachToApp: !config.vcr,
    });
  }

  private openComponent(Component: Type<any>, { config, dialogRef }: OpenParams) {
    const componentRef = createComponent(Component, {
      elementInjector: Injector.create({
        providers: [
          {
            provide: DialogRef,
            useValue: dialogRef,
          },
          {
            provide: DIALOG_CONFIG,
            useValue: config,
          },
        ],
        parent: config.vcr?.injector || this.injector,
      }),
      environmentInjector: this.injector,
    });

    return this.attach({
      dialogRef,
      config,
      ref: componentRef,
      view: componentRef.hostView,
      attachToApp: true,
    });
  }

  private attach({ dialogRef, config, ref, view, attachToApp }: AttachOptions): DialogRef<any, any, any> {
    const dialog = this.createDialog(config, dialogRef, view);

    const container = config.container instanceof ElementRef ? config.container.nativeElement : config.container;

    const hooks = {
      after: new Subject<unknown>(),
    };

    const onClose = (result: unknown) => {
      this.globalConfig.onClose?.();
      this.dialogs = this.dialogs.filter(({ id }) => dialogRef.id !== id);
      this.hasOpenDialogSub.next(this.hasOpenDialogs());

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
        onReset: null,
      });

      hooks.after.next(result);
      hooks.after.complete();
      if (this.dialogs.length === 0) {
        this.document.body.classList.remove(OVERFLOW_HIDDEN_CLASS);
      }
    };

    const onReset = (offset?: DragOffset) => {
      dialog.instance.reset(offset);
    };

    dialogRef.mutate({
      id: config.id,
      data: config.data,
      ref,
      onClose,
      afterClosed$: hooks.after.asObservable(),
      onReset,
    });

    container.appendChild(dialog.location.nativeElement);
    this.appRef.attachView(dialog.hostView);

    if (attachToApp) {
      this.appRef.attachView(view);
    }

    return dialogRef.asDialogRef();
  }

  private createDialog(config: DialogConfig, dialogRef: InternalDialogRef, view: ViewRef) {
    return createComponent(DialogComponent, {
      elementInjector: Injector.create({
        providers: [
          {
            provide: InternalDialogRef,
            useValue: dialogRef,
          },
          {
            provide: NODES_TO_INSERT,
            useValue: (view as any).rootNodes,
          },
          {
            provide: DIALOG_CONFIG,
            useValue: config,
          },
        ],
        parent: this.injector,
      }),
      environmentInjector: this.injector,
    });
  }

  private mergeConfig(inlineConfig: Partial<DialogConfig>): DialogConfig & GlobalDialogConfig {
    return {
      ...this.globalConfig,
      id: nanoid(),
      ...inlineConfig,
      sizes: this.globalConfig?.sizes,
    } as DialogConfig & GlobalDialogConfig;
  }
}

function throwMustBeAComponentOrATemplateRef(value: unknown): never {
  throw new TypeError(`Dialog must receive a Component or a TemplateRef, but this has been passed instead: ${value}`);
}

function nanoid() {
  return `dialog-${Math.random().toString(36).substring(7)}`;
}
