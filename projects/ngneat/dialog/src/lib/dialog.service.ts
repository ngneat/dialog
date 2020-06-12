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
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, filter, first, tap } from 'rxjs/operators';
import { nanoid } from 'nanoid';

import { DialogRef } from './dialog-ref';

const dimensions = {
  small: {
    width: '100px',
    height: '100px'
  },
  medium: {
    width: '100px',
    height: '100px'
  },
  large: {
    width: '100px',
    height: '100px'
  }
} as const;

interface DialogConfig {
  id: string;
  backdrop: boolean;
  container: HTMLElement;
  windowClass: string;
  enableClose: boolean;
  size: keyof typeof dimensions;
  width: string;
  height: string;
  draggable: boolean;
  fullScreen: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  public dialogs: DialogRef[] = [];

  constructor(
    private appRef: ApplicationRef,
    @Inject(DOCUMENT) private document: Document,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  open<T>(template: TemplateRef<T>, config?: Partial<DialogConfig>): DialogRef<TemplateRef<T>>;
  open<T>(component: Type<T>, config?: Partial<DialogConfig>): DialogRef<ComponentRef<T>>;
  open<T>(componentOrTemplate: Type<T> | TemplateRef<T>, config: Partial<DialogConfig> = {}): DialogRef<any> {
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
          }
        ],
        parent: this.injector
      })
    );

    return this.attach(
      dialogRef,
      componentRef,
      [componentRef.location.nativeElement],
      componentRef.hostView,
      this.mergeConfig(config)
    );
  }

  private openTemplate(template: TemplateRef<any>, config: Partial<DialogConfig>) {
    const dialogRef = new DialogRef();

    const view = template.createEmbeddedView({
      get $implicit() {
        return dialogRef;
      }
    });

    return this.attach(dialogRef, template, view.rootNodes, view, this.mergeConfig(config));
  }

  private attach<Ref extends ComponentRef<any> | TemplateRef<any>>(
    dialogRef: DialogRef,
    ref: Ref,
    nodes: Element[],
    view: ViewRef,
    config: DialogConfig
  ) {
    const root = this.document.createElement('div');
    const dialogElement = this.document.createElement('div');

    let backdropClick$ = fromEvent<MouseEvent>(this.document.body, 'mouseup');

    if (config.backdrop) {
      const backdrop = this.document.createElement('div');
      backdrop.classList.add('ngneat-dialog-backdrop');
      root.appendChild(backdrop);

      backdropClick$ = fromEvent<MouseEvent>(backdrop, 'mouseup');
    }

    if (config.windowClass) {
      dialogElement.classList.add(config.windowClass);
    }

    if (config.width != null) {
      dialogElement.style.width = config.width;
    }

    if (config.height != null) {
      dialogElement.style.height = config.height;
    }

    if (config.fullScreen) {
      dialogElement.classList.add('ngneat-dialog-fullscreen');
    }

    const destroy$ = new Subject();

    const dispose = () => {
      destroy$.next();
      destroy$.complete();

      this.dialogs = this.dialogs.filter(({ id }) => dialogRef.id !== id);

      this.appRef.detachView(view);
      view.destroy();
      view = null;
      config.container.removeChild(root);
    };

    if (config.enableClose) {
      merge(
        fromEvent<KeyboardEvent>(this.document.body, 'keyup').pipe(filter(({ key }) => key === 'Escape')),
        backdropClick$.pipe(filter(({ target }) => !dialogElement.contains(target as Element)))
      )
        .pipe(first(), tap(dispose), takeUntil(destroy$))
        .subscribe();
    }

    dialogElement.classList.add('ngneat-dialog-content');
    dialogElement.append(...nodes);

    root.classList.add('ngneat-dialog');
    root.appendChild(dialogElement);

    this.mutateDialogRef(dialogRef, {
      id: config.id,
      ref,
      dispose,
      backdropClick$
    });
    this.dialogs.push(dialogRef);

    this.appRef.attachView(view);
    config.container.appendChild(root);

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
      fullScreen: false
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

  private throwMustBeAComponentOrATemplateRef(value: any): never {
    throw new Error(`${value} must be a Component or a TemplateRef`);
  }

  private mutateDialogRef(dialogRef: DialogRef, props: Partial<DialogRef>) {
    Object.assign(dialogRef, props);
  }
}
