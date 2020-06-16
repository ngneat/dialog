import { ApplicationRef, ComponentFactoryResolver, TemplateRef, Injector, InjectionToken } from '@angular/core';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { DialogService } from './dialog.service';
import { DIALOG_CONFIG, NODES_TO_INSERT, DIALOG_DATA } from './tokens';
import { DOCUMENT } from '@angular/common';
import { DialogConfig } from './config';
import { DialogRef } from './dialog-ref';
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
        provide: DIALOG_CONFIG,
        useValue: {
          sm: 'other sm',
          md: 'other md',
          lg: 'other lg'
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
        lg: 'other lg'
      })
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
        $implicit: dialog,
        data: 'test'
      });
    });

    it('should fill dialog injector', () => {
      const fakeTemplate = new FakeTemplateRef();
      const dialog = service.open(fakeTemplate);

      const fakeTemplateView = fakeTemplate.view;

      expect(fakeFactory.factory.create).toHaveBeenCalledTimes(1);
      const [injector]: Injector[] = fakeFactory.factory.create.calls.mostRecent().args;
      expect(injector.get(DialogRef)).toBe(dialog);
      expect(injector.get<any>(NODES_TO_INSERT)).toBe(fakeTemplateView.rootNodes);
    });

    it('should append dialog element into container', () => {
      service.open(new FakeTemplateRef());

      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeDocument.body.appendChild).toHaveBeenCalledTimes(1);
      expect(fakeDocument.body.appendChild).toHaveBeenCalledWith(fakeDialogView.location.nativeElement);
    });

    it('should attach view to ApplicationRef', () => {
      service.open(new FakeTemplateRef());

      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeAppRef.attachView).toHaveBeenCalledTimes(1);
      expect(fakeAppRef.attachView).toHaveBeenCalledWith(fakeDialogView.hostView as any);
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
        $implicit: dialog,
        data: 'test'
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
      });

      const [
        [fakeComponentInjector],
        [dialogInjector]
      ]: readonly Injector[][] = fakeFactory.factory.create.calls.allArgs();
      expect(fakeComponentInjector.get(DialogRef)).toBe(dialog);
      expect(fakeComponentInjector.get<any>(NODES_TO_INSERT, null)).toBeNull();
      expect(fakeComponentInjector.get(DIALOG_DATA)).toBe('test');

      const fakeDialogView = fakeFactory.componentOne;

      expect(dialogInjector.get(DialogRef)).toBe(dialog);
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

      const { componentOne: fakeDialogView, componentTwo: fakeComponentView } = fakeFactory;

      const attachSpyCalls = (fakeAppRef.attachView as jasmine.Spy).calls.allArgs();

      expect(fakeAppRef.attachView).toHaveBeenCalledTimes(2);
      expect(attachSpyCalls).toEqual([[fakeDialogView.hostView], [fakeComponentView.hostView]]);
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

  describe('on dispose', () => {
    let dialog: DialogRef;
    let fakeTemplate: FakeTemplateRef;

    beforeEach(() => {
      fakeTemplate = new FakeTemplateRef();
      dialog = service.open(fakeTemplate);
    });

    it('beforeClose$ should be able of cancel dispose', () => {
      let afterClosedCalled = false;
      dialog.beforeClose$.subscribe({ next: cancel => cancel() });
      dialog.afterClosed$.subscribe({ next: () => (afterClosedCalled = true) });

      dialog.dispose();

      expect(dialog.dispose).toBeTruthy();
      expect(afterClosedCalled).toBeFalse();
    });

    it('should remove dialog from dialogs', () => {
      dialog.dispose();

      expect(service.dialogs).toEqual([]);
    });

    it('should remove child from container', () => {
      dialog.dispose();
      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeDocument.body.removeChild).toHaveBeenCalledTimes(1);
      expect(fakeDocument.body.removeChild).toHaveBeenCalledWith(fakeDialogView.location.nativeElement);
    });

    it('should detach view from ApplicationRef', () => {
      dialog.dispose();

      expect(fakeAppRef.detachView).toHaveBeenCalledTimes(2);
      const attachSpyCalls = (fakeAppRef.detachView as jasmine.Spy).calls.allArgs();

      const fakeDialogView = fakeFactory.componentOne;

      expect(fakeAppRef.detachView).toHaveBeenCalledTimes(2);
      expect(attachSpyCalls).toEqual([[fakeDialogView.hostView], [fakeTemplate.view]]);
    });

    it('should remove references from DialogRef', () => {
      dialog.dispose();

      const dialogCleaned: DialogRef = {
        id: dialog.id,
        data: dialog.data,
        afterClosed$: null,
        backdropClick$: null,
        beforeClose$: null,
        dispose: null,
        ref: null
      };

      expect(dialog).toEqual(jasmine.objectContaining(dialogCleaned));
    });

    it('should emit afterClosed$ and complete it', () => {
      let hasNext = false;
      let hasCompleted = false;
      dialog.afterClosed$.subscribe({ next: () => (hasNext = true), complete: () => (hasCompleted = true) });

      dialog.dispose();

      expect(hasNext).toBeTrue();
      expect(hasCompleted).toBeTrue();
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
      fullScreen: true,
      size: 'lg',
      width: '99999px',
      height: '-999999px',
      enableClose: false,
      backdrop: false,
      id: 'test',
      windowClass: 'test',
      sizes: {
        lg: 'test' as any
      } as any
    };

    service.open(template, otherConfig);

    const [injector]: Injector[] = fakeFactory.factory.create.calls.mostRecent().args;

    expect(injector.get(DIALOG_CONFIG)).toEqual(jasmine.objectContaining(otherConfig));
  });
});
