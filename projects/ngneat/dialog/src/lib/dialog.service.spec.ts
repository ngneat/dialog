import { ApplicationRef, ComponentFactoryResolver, TemplateRef, Injector, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { timer } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { DialogService } from './dialog.service';
import { NODES_TO_INSERT, GLOBAL_DIALOG_CONFIG, DIALOG_CONFIG } from './tokens';
import { DialogConfig } from './config';
import { InternalDialogRef, DialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';

class FakeFactoryResolver extends ComponentFactoryResolver {
  componentOne = {
    destroy: jasmine.createSpy(),
    hostView: {
      destroy: jasmine.createSpy(),
      rootNodes: 'nodes 1'
    },
    location: {
      nativeElement: 'fake 1'
    }
  };

  componentTwo = {
    destroy: jasmine.createSpy(),
    hostView: {
      destroy: jasmine.createSpy(),
      rootNodes: 'nodes 2'
    },
    location: {
      nativeElement: 'fake 2'
    }
  };

  factory = {
    create: jasmine.createSpy().and.returnValues(this.componentOne, this.componentTwo)
  };

  resolveComponentFactory = jasmine.createSpy().and.returnValue(this.factory);
}

class FakeTemplateRef extends TemplateRef<any> {
  elementRef = null;

  view = {
    rootNodes: 'template nodes',
    destroy: jasmine.createSpy()
  };

  createEmbeddedView = jasmine.createSpy().and.returnValue(this.view);
}

describe('DialogService', () => {
  let spectator: SpectatorService<DialogService>;
  let service: DialogService;
  let fakeAppRef: ApplicationRef;
  let fakeFactory: FakeFactoryResolver;
  let fakeDocument: { body: { appendChild: jasmine.Spy; removeChild: jasmine.Spy } };

  const createService = createServiceFactory({
    service: DialogService,
    mocks: [ApplicationRef],
    providers: [
      {
        provide: GLOBAL_DIALOG_CONFIG,
        useValue: {
          sizes: {
            sm: 'other sm',
            md: 'other md',
            lg: 'other lg',
            fullScreen: 'other fullScreen'
          }
        }
      },
      {
        provide: ComponentFactoryResolver,
        useClass: FakeFactoryResolver
      },
      {
        provide: DOCUMENT,
        useFactory: () => ({
          body: {
            appendChild: jasmine.createSpy(),
            removeChild: jasmine.createSpy()
          }
        })
      }
    ]
  });

  beforeEach(() => {
    spectator = createService();
    service = spectator.service;
    fakeAppRef = spectator.get(ApplicationRef);
    fakeFactory = spectator.get<FakeFactoryResolver>(ComponentFactoryResolver);
    fakeDocument = spectator.get<any>(DOCUMENT);
  });

  it('should create it', () => {
    expect(service).toBeTruthy();
  });

  it('should overwrite sizes', () => {
    service.open(new FakeTemplateRef());

    const [injector]: Injector[] = fakeFactory.factory.create.calls.mostRecent().args;

    expect(injector.get(DIALOG_CONFIG).sizes).toEqual(
      jasmine.objectContaining({
        sm: 'other sm',
        md: 'other md',
        lg: 'other lg',
        fullScreen: 'other fullScreen'
      })
    );
  });

  it('should throw if two dialogs has the same id', () => {
    service.open(new FakeTemplateRef(), { id: 'same' });

    expect(() => service.open(new FakeTemplateRef(), { id: 'same' })).toThrowError(
      'Please, ID must be unique, but there is already a dialog created with this ID: same'
    );
  });

  describe('using a template', () => {
    it('should open it', () => expect(service.open(new FakeTemplateRef())).toBeTruthy());

    it('should add dialog to dialogs', () => {
      const dialog = service.open(new FakeTemplateRef());

      expect(service.dialogs.length).toBe(1);
      expect(service.dialogs).toContain(dialog);
    });

    it('should instanciate template', () => {
      const fakeTemplate = new FakeTemplateRef();
      const dialog = service.open(fakeTemplate, {
        data: 'test'
      });

      expect(dialog.ref).toBe(fakeTemplate);
      expect(fakeTemplate.createEmbeddedView).toHaveBeenCalledTimes(1);
      expect(fakeTemplate.createEmbeddedView).toHaveBeenCalledWith({
        $implicit: dialog
      });
    });

    it('should fill dialog injector', () => {
      const fakeTemplate = new FakeTemplateRef();
      const dialog = service.open(fakeTemplate) as InternalDialogRef;

      const fakeTemplateView = fakeTemplate.view;

      expect(fakeFactory.factory.create).toHaveBeenCalledTimes(1);
      const [injector]: Injector[] = fakeFactory.factory.create.calls.mostRecent().args;
      expect(injector.get(InternalDialogRef)).toBe(dialog);
      expect(injector.get<any>(NODES_TO_INSERT)).toBe(fakeTemplateView.rootNodes);
    });

    it('should append dialog element into container', () => {
      service.open(new FakeTemplateRef());

      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeDocument.body.appendChild).toHaveBeenCalledTimes(1);
      expect(fakeDocument.body.appendChild).toHaveBeenCalledWith(fakeDialogView.location.nativeElement);
    });

    it('should attach view to ApplicationRef', () => {
      const fakeTemplate = new FakeTemplateRef();
      service.open(fakeTemplate);

      const fakeDialogView = fakeFactory.componentOne;

      const attachSpyCalls = (fakeAppRef.attachView as jasmine.Spy).calls.allArgs();

      expect(fakeAppRef.attachView).toHaveBeenCalledTimes(2);
      expect(attachSpyCalls).toEqual([[fakeDialogView.hostView], [fakeTemplate.view]]);
    });

    it('should use vcr to instanciate template', () => {
      const template = new FakeTemplateRef();
      const otherVCR = new FakeTemplateRef();

      const dialog = service.open(template, {
        vcr: otherVCR as any,
        data: 'test'
      });

      expect(template.createEmbeddedView).not.toHaveBeenCalled();
      expect(otherVCR.createEmbeddedView).toHaveBeenCalledWith(template, {
        $implicit: dialog
      });
    });
  });

  describe('using a component', () => {
    class FakeComponent {}

    it('should open it', () => expect(service.open(FakeComponent)).toBeTruthy());

    it('should add dialog to dialogs', () => {
      const dialog = service.open(FakeComponent);

      expect(service.dialogs.length).toBe(1);
      expect(service.dialogs).toContain(dialog);
    });

    it('should instanciate component', () => {
      service.open(FakeComponent);

      expect(fakeFactory.resolveComponentFactory).toHaveBeenCalledTimes(2);
      expect(fakeFactory.resolveComponentFactory.calls.allArgs()).toEqual([[DialogComponent], [FakeComponent]]);

      expect(fakeFactory.factory.create).toHaveBeenCalledTimes(2);
    });

    it('should fill component and dialog injector', () => {
      const dialog = service.open(FakeComponent, {
        data: 'test'
      }) as InternalDialogRef;

      const [
        [fakeComponentInjector],
        [dialogInjector]
      ]: readonly Injector[][] = fakeFactory.factory.create.calls.allArgs();
      expect(fakeComponentInjector.get(DialogRef)).toBe(dialog);
      expect(fakeComponentInjector.get<any>(NODES_TO_INSERT, null)).toBeNull();

      const fakeDialogView = fakeFactory.componentOne;

      expect(dialogInjector.get(InternalDialogRef)).toBe(dialog);
      expect(dialogInjector.get<any>(NODES_TO_INSERT)).toBe(fakeDialogView.hostView.rootNodes);
    });

    it('should append dialog element into container', () => {
      service.open(FakeComponent);

      const fakeComponentView = fakeFactory.componentTwo;

      expect(fakeDocument.body.appendChild).toHaveBeenCalledTimes(1);
      expect(fakeDocument.body.appendChild).toHaveBeenCalledWith(fakeComponentView.location.nativeElement);
    });

    it('should attach view to ApplicationRef', () => {
      service.open(FakeComponent);

      const { componentOne: fakeComponentInjectedIntoDialog, componentTwo: fakeDialogView } = fakeFactory;

      const attachSpyCalls = (fakeAppRef.attachView as jasmine.Spy).calls.allArgs();

      expect(fakeAppRef.attachView).toHaveBeenCalledTimes(2);
      expect(attachSpyCalls).toEqual([[fakeDialogView.hostView], [fakeComponentInjectedIntoDialog.hostView]]);
    });

    it('should use injector of vcr as parent injector', () => {
      const FROM_PARENT = new InjectionToken<string>('FROM_PARENT');

      service.open(FakeComponent, {
        vcr: { injector: Injector.create({ providers: [{ provide: FROM_PARENT, useValue: 'test' }] }) } as any
      });

      const [[fakeComponentInjector]]: readonly Injector[][] = fakeFactory.factory.create.calls.allArgs();

      expect(fakeComponentInjector.get(FROM_PARENT)).toBe('test');
    });
  });

  describe('on close', () => {
    let dialog: InternalDialogRef;
    let fakeTemplate: FakeTemplateRef;

    beforeEach(() => {
      fakeTemplate = new FakeTemplateRef();
      dialog = service.open(fakeTemplate) as InternalDialogRef;
    });

    describe('using beforeClose', () => {
      let dialogHasBeenClosed: boolean;

      beforeEach(() => {
        dialogHasBeenClosed = false;
        dialog.afterClosed$.subscribe({ next: () => (dialogHasBeenClosed = true) });
      });

      it('should close if there are no guards', () => {
        expect(dialog.beforeCloseGuards).toEqual([]);

        dialog.close();

        expect(dialogHasBeenClosed).toBeTrue();
      });

      it('should pass result to guard', () => {
        dialog.beforeClose(result => {
          expect(result).toBe('test');

          return true;
        });

        dialog.close('test');
      });

      it('should add guard', () => {
        const guard = () => false;

        dialog.beforeClose(guard);

        expect(dialog.beforeCloseGuards).toEqual([guard]);
      });

      describe('should abort close', () => {
        it('using a sync function', () => {
          dialog.beforeClose(() => false);

          dialog.close();

          expect(dialogHasBeenClosed).toBeFalse();
        });

        it('using a promise', fakeAsync(() => {
          dialog.beforeClose(
            () => new Promise<boolean>(r => setTimeout(() => r(false), 1000))
          );

          dialog.close();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('using an observable', fakeAsync(() => {
          dialog.beforeClose(() => timer(1000).pipe(mapTo(false)));

          dialog.close();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('using more than one guard', fakeAsync(() => {
          dialog.beforeClose(() => false);
          dialog.beforeClose(
            () => new Promise<boolean>(r => setTimeout(() => r(false), 1000))
          );
          dialog.beforeClose(() => timer(1000).pipe(mapTo(false)));

          dialog.close();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('when only one guard returns false', fakeAsync(() => {
          dialog.beforeClose(() => true);
          dialog.beforeClose(
            () => new Promise<boolean>(r => setTimeout(() => r(false), 1000))
          );
          dialog.beforeClose(() => timer(3000).pipe(mapTo(true)));

          dialog.close();

          expect(dialogHasBeenClosed).toBeFalse();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();

          tick(2000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));
      });

      it('should close dialog after all guards return true', fakeAsync(() => {
        dialog.beforeClose(() => true);
        dialog.beforeClose(
          () => new Promise<boolean>(r => setTimeout(() => r(true), 1000))
        );
        dialog.beforeClose(() => timer(3000).pipe(mapTo(true)));

        dialog.close();

        expect(dialogHasBeenClosed).toBeFalse();

        tick(1000);

        expect(dialogHasBeenClosed).toBeFalse();

        tick(2000);

        expect(dialogHasBeenClosed).toBeTrue();
      }));
    });

    it('should remove dialog from dialogs', () => {
      dialog.close();

      expect(service.dialogs).toEqual([]);
    });

    it('should remove child from container', () => {
      dialog.close();
      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeDocument.body.removeChild).toHaveBeenCalledTimes(1);
      expect(fakeDocument.body.removeChild).toHaveBeenCalledWith(fakeDialogView.location.nativeElement);
    });

    it('should detach view from ApplicationRef', () => {
      dialog.close();

      expect(fakeAppRef.detachView).toHaveBeenCalledTimes(2);
      const attachSpyCalls = (fakeAppRef.detachView as jasmine.Spy).calls.allArgs();

      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeAppRef.detachView).toHaveBeenCalledTimes(2);
      expect(attachSpyCalls).toEqual([[fakeDialogView.hostView], [fakeTemplate.view]]);
    });

    it('should remove references from DialogRef', () => {
      dialog.close();

      const dialogCleaned: Partial<InternalDialogRef> = {
        id: dialog.id,
        data: dialog.data,
        afterClosed$: null,
        backdropClick$: null,
        beforeCloseGuards: null,
        onClose: null,
        ref: null
      };

      expect(dialog).toEqual(jasmine.objectContaining(dialogCleaned));
    });

    it('should emit afterClosed$ and complete it', () => {
      let hasNext = false;
      let hasCompleted = false;
      dialog.afterClosed$.subscribe({ next: () => (hasNext = true), complete: () => (hasCompleted = true) });

      dialog.close();

      expect(hasNext).toBeTrue();
      expect(hasCompleted).toBeTrue();
    });

    it('should send result in afterClosed$', () => {
      dialog.afterClosed$.subscribe({ next: result => expect(result).toBe('test') });

      dialog.close('test');
    });
  });

  it('should use container to place dialog element', () => {
    const template = new FakeTemplateRef();
    const otherContainer = {
      appendChild: jasmine.createSpy()
    };

    service.open(template, {
      container: otherContainer as any
    });

    expect(fakeDocument.body.appendChild).not.toHaveBeenCalled();
    expect(otherContainer.appendChild).toHaveBeenCalledWith('fake 1');
  });

  it('should overwrite default config', () => {
    const template = new FakeTemplateRef();

    const otherConfig: Partial<DialogConfig> = {
      draggable: true,
      size: 'lg',
      width: '99999px',
      height: '-999999px',
      enableClose: false,
      backdrop: false,
      id: 'test',
      windowClass: 'test',
      sizes: {
        lg: 'test' as any
      }
    };

    service.open(template, otherConfig);

    const [injector]: Injector[] = fakeFactory.factory.create.calls.mostRecent().args;

    expect(injector.get(DIALOG_CONFIG)).toEqual(
      jasmine.objectContaining({
        ...otherConfig,
        sizes: {
          sm: 'other sm',
          md: 'other md',
          fullScreen: 'other fullScreen',
          ...otherConfig.sizes
        }
      })
    );
  });
});
