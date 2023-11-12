import { ApplicationRef, Component, TemplateRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { mapTo, timer } from 'rxjs';

import { InternalDialogRef } from '../dialog-ref';
import { DialogService } from '../dialog.service';
import { DIALOG_DOCUMENT_REF, GLOBAL_DIALOG_CONFIG, provideDialogConfig } from '../providers';

class FakeTemplateRef extends TemplateRef<any> {
  elementRef = null;
  view = {
    rootNodes: [document.createTextNode('template'), document.createTextNode(' nodes')],
    destroy: jasmine.createSpy(),
  };

  createEmbeddedView = jasmine.createSpy().and.returnValue(this.view);
}

describe('DialogService', () => {
  let spectator: SpectatorService<DialogService>;
  let service: DialogService;
  let fakeAppRef: ApplicationRef;
  let fakeDocument: {
    body: {
      appendChild: jasmine.Spy;
      removeChild: jasmine.Spy;
      classList: { add: jasmine.Spy; remove: jasmine.Spy };
    };
  };

  const createService = createServiceFactory({
    service: DialogService,
    mocks: [ApplicationRef],
    providers: [
      provideDialogConfig({
        sizes: {
          sm: { width: '20px' },
          md: { width: '20px' },
          lg: { width: '20px' },
          fullScreen: { width: '20px' },
        },
      }),
      {
        provide: DIALOG_DOCUMENT_REF,
        useFactory: () => ({
          body: {
            appendChild: jasmine.createSpy(),
            removeChild: jasmine.createSpy(),
            classList: {
              add: jasmine.createSpy(),
              remove: jasmine.createSpy(),
            },
          },
        }),
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
    service = spectator.service;
    fakeAppRef = spectator.inject(ApplicationRef);
    fakeDocument = spectator.inject<any>(DIALOG_DOCUMENT_REF);
  });

  it('should create it', () => {
    expect(service).toBeTruthy();
  });

  it('should overwrite sizes', () => {
    service.open(new FakeTemplateRef());

    expect(spectator.inject(GLOBAL_DIALOG_CONFIG).sizes).toEqual(
      jasmine.objectContaining({
        sm: { width: '20px' },
        md: { width: '20px' },
        lg: { width: '20px' },
        fullScreen: { width: '20px' },
      }),
    );
  });

  it('should generate valid dialog id', () => {
    const dialog = service.open(new FakeTemplateRef());
    const idValidityRegex = /^[A-Za-z]+[\w-:.]*$/;

    expect(idValidityRegex.test(dialog.id)).toBe(true);
  });

  it('should skip opening if two dialogs has the same id', () => {
    const onOpenSpy = jasmine.createSpy();
    const open = () => service.open(new FakeTemplateRef(), { id: 'same', onOpen: onOpenSpy });
    open();
    open();
    expect(onOpenSpy).toHaveBeenCalledTimes(1);
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
        data: 'test',
        windowClass: 'custom-template',
      });

      expect(dialog.ref).toBe(fakeTemplate);
      expect(fakeTemplate.createEmbeddedView).toHaveBeenCalledTimes(1);
      expect(fakeTemplate.createEmbeddedView).toHaveBeenCalledWith({
        $implicit: dialog,
        config: jasmine.objectContaining({ windowClass: 'custom-template' }),
      });
    });

    it('should append dialog element into container', () => {
      service.open(new FakeTemplateRef());

      expect(fakeDocument.body.appendChild).toHaveBeenCalledTimes(1);
    });

    it('should use vcr to instanciate template', () => {
      const template = new FakeTemplateRef();
      const otherVCR = new FakeTemplateRef();

      const dialog = service.open(template, {
        vcr: otherVCR as any,
        data: 'test',
        windowClass: 'custom-template',
      });

      expect(template.createEmbeddedView).not.toHaveBeenCalled();
      expect(otherVCR.createEmbeddedView).toHaveBeenCalledWith(template, {
        $implicit: dialog,
        config: jasmine.objectContaining({ windowClass: 'custom-template' }),
      });
    });
  });

  describe('when nested', () => {
    it('should open both', () => {
      expect(service.open(new FakeTemplateRef())).toBeTruthy();
      expect(service.open(new FakeTemplateRef())).toBeTruthy();
    });

    it('should add both dialogs to dialogs', () => {
      const dialog1 = service.open(new FakeTemplateRef());
      const dialog2 = service.open(new FakeTemplateRef());

      expect(service.dialogs.length).toBe(2);
      expect(service.dialogs).toContain(dialog1);
      expect(service.dialogs).toContain(dialog2);
    });

    it('should add OVERFLOW_HIDDEN_CLASS to body only once', () => {
      service.open(new FakeTemplateRef());
      service.open(new FakeTemplateRef());

      expect(fakeDocument.body.classList.add).toHaveBeenCalledTimes(1);
    });

    it('should not remove OVERFLOW_HIDDEN_CLASS from when close one', () => {
      const dialog1 = service.open(new FakeTemplateRef());
      service.open(new FakeTemplateRef());

      dialog1.close();
      expect(fakeDocument.body.classList.remove).toHaveBeenCalledTimes(0);
    });

    it('should remove OVERFLOW_HIDDEN_CLASS from when close all', () => {
      const dialog1 = service.open(new FakeTemplateRef());
      const dialog2 = service.open(new FakeTemplateRef());

      dialog1.close();
      dialog2.close();
      expect(fakeDocument.body.classList.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('using a component', () => {
    @Component({ selector: '', template: '' })
    class FakeComponent {}
    it('should open it', () => expect(service.open(FakeComponent)).toBeTruthy());

    it('should add dialog to dialogs', () => {
      const dialog = service.open(FakeComponent);
      expect(service.dialogs.length).toBe(1);
      expect(service.dialogs).toContain(dialog);
    });

    it('should append dialog element into container', () => {
      service.open(FakeComponent);
      expect(fakeDocument.body.appendChild).toHaveBeenCalledTimes(1);
    });
    it('should attach view to ApplicationRef', () => {
      service.open(FakeComponent);
      expect(fakeAppRef.attachView).toHaveBeenCalledTimes(2);
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
        dialog.beforeClose((result) => {
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
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));

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
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));
          dialog.beforeClose(() => timer(1000).pipe(mapTo(false)));

          dialog.close();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('when only one guard returns false', fakeAsync(() => {
          dialog.beforeClose(() => true);
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));
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
        dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(true), 1000)));
        dialog.beforeClose(() => timer(3000).pipe(mapTo(true)));

        dialog.close();

        expect(dialogHasBeenClosed).toBeFalse();

        tick(1000);

        expect(dialogHasBeenClosed).toBeFalse();

        tick(2000);

        expect(dialogHasBeenClosed).toBeTrue();
      }));
    });

    describe('using closeAll', () => {
      let dialogHasBeenClosed: boolean;

      beforeEach(() => {
        dialogHasBeenClosed = false;
        dialog.afterClosed$.subscribe({ next: () => (dialogHasBeenClosed = true) });
      });

      it('should close if there are no guards', () => {
        expect(dialog.beforeCloseGuards).toEqual([]);

        service.closeAll();

        expect(dialogHasBeenClosed).toBeTrue();
      });

      describe('should abort close', () => {
        it('using a sync function', () => {
          dialog.beforeClose(() => false);

          service.closeAll();

          expect(dialogHasBeenClosed).toBeFalse();
        });

        it('using a promise', fakeAsync(() => {
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));

          service.closeAll();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('using an observable', fakeAsync(() => {
          dialog.beforeClose(() => timer(1000).pipe(mapTo(false)));

          service.closeAll();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('using more than one guard', fakeAsync(() => {
          dialog.beforeClose(() => false);
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));
          dialog.beforeClose(() => timer(1000).pipe(mapTo(false)));

          service.closeAll();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));

        it('when only one guard returns false', fakeAsync(() => {
          dialog.beforeClose(() => true);
          dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(false), 1000)));
          dialog.beforeClose(() => timer(3000).pipe(mapTo(true)));

          service.closeAll();

          expect(dialogHasBeenClosed).toBeFalse();

          tick(1000);

          expect(dialogHasBeenClosed).toBeFalse();

          tick(2000);

          expect(dialogHasBeenClosed).toBeFalse();
        }));
      });

      it('should close dialog after all guards return true', fakeAsync(() => {
        dialog.beforeClose(() => true);
        dialog.beforeClose(() => new Promise<boolean>((r) => setTimeout(() => r(true), 1000)));
        dialog.beforeClose(() => timer(3000).pipe(mapTo(true)));

        service.closeAll();

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

      expect(fakeDocument.body.removeChild).toHaveBeenCalledTimes(1);
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
        ref: null,
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
      dialog.afterClosed$.subscribe({ next: (result) => expect(result).toBe('test') });

      dialog.close('test');
    });
  });

  it('should use container to place dialog element', () => {
    const template = new FakeTemplateRef();
    const otherContainer = {
      appendChild: jasmine.createSpy(),
    };

    service.open(template, {
      container: otherContainer as any,
    });

    expect(fakeDocument.body.appendChild).not.toHaveBeenCalled();
    expect(otherContainer.appendChild).toHaveBeenCalledTimes(1);
  });
});
