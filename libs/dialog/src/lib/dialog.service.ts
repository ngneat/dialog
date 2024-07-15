import {
  ApplicationRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  reflectComponentType,
  TemplateRef,
  Type,
  ViewRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { DialogRef, InternalDialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DragOffset } from './draggable.directive';
import { DIALOG_DOCUMENT_REF, GLOBAL_DIALOG_CONFIG, NODES_TO_INSERT } from './providers';
import { AttachOptions, DialogConfig, ExtractData, ExtractResult, GlobalDialogConfig } from './types';

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

    if (isComponent(componentOrTemplate)) {
      mergedConfig.id ??= reflectComponentType(componentOrTemplate)?.selector;
    }

    if (this.isOpen(mergedConfig.id)) {
      return;
    }

    const dialogRef = new InternalDialogRef({
      config: mergedConfig,
      backdropClick$: new Subject<MouseEvent>(),
    });

    const attachOptions = isTemplate(componentOrTemplate)
      ? this.openTemplate(componentOrTemplate, dialogRef)
      : isComponent(componentOrTemplate)
      ? this.openComponent(componentOrTemplate, dialogRef)
      : throwMustBeAComponentOrATemplateRef(componentOrTemplate);

    if (this.isOpen(dialogRef.id)) {
      attachOptions.view.destroy();
      return;
    }

    mergedConfig.onOpen?.();

    this.dialogs.push(dialogRef);
    this.hasOpenDialogSub.next(true);

    if (this.dialogs.length === 1) {
      this.document.body.classList.add(OVERFLOW_HIDDEN_CLASS);
    }

    return this.attach(dialogRef, attachOptions);
  }

  private openTemplate(template: TemplateRef<any>, dialogRef: InternalDialogRef) {
    const config = dialogRef.config;
    const context = {
      $implicit: dialogRef,
      config,
    };

    const view = config.vcr?.createEmbeddedView(template, context) || template.createEmbeddedView(context);

    return {
      ref: template,
      view,
      attachToApp: !config.vcr,
    };
  }

  private openComponent(Component: Type<any>, dialogRef: InternalDialogRef) {
    const componentRef = createComponent(Component, {
      elementInjector: Injector.create({
        providers: [
          {
            provide: DialogRef,
            useValue: dialogRef,
          },
        ],
        parent: dialogRef.config.vcr?.injector || this.injector,
      }),
      environmentInjector: this.injector,
    });

    return {
      ref: componentRef,
      view: componentRef.hostView,
      attachToApp: true,
    };
  }

  private attach(dialogRef: InternalDialogRef, { ref, view, attachToApp }: AttachOptions): DialogRef<any, any, any> {
    const dialog = this.createDialog(dialogRef, view);

    const container = getNativeElement(dialogRef.config.container);

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
      if (!this.hasOpenDialogs()) {
        this.document.body.classList.remove(OVERFLOW_HIDDEN_CLASS);
      }
    };

    const onReset = (offset?: DragOffset) => {
      dialog.instance.reset(offset);
    };

    dialogRef.mutate({
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

  private createDialog(dialogRef: InternalDialogRef, view: ViewRef) {
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
        ],
        parent: this.injector,
      }),
      environmentInjector: this.injector,
    });
  }

  private mergeConfig(inlineConfig: Partial<DialogConfig>): DialogConfig & GlobalDialogConfig {
    return {
      ...this.globalConfig,
      ...inlineConfig,
      sizes: this.globalConfig?.sizes,
    } as DialogConfig & GlobalDialogConfig;
  }
}

function throwMustBeAComponentOrATemplateRef(value: unknown): never {
  throw new TypeError(`Dialog must receive a Component or a TemplateRef, but this has been passed instead: ${value}`);
}

function getNativeElement(element: Element | ElementRef): Element {
  return element instanceof ElementRef ? element.nativeElement : element;
}

function isTemplate(tplOrComp: any): tplOrComp is TemplateRef<any> {
  return tplOrComp instanceof TemplateRef;
}

function isComponent(tplOrComp: any): tplOrComp is Type<any> {
  return !isTemplate(tplOrComp) && typeof tplOrComp === 'function';
}
