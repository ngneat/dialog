import { byText, createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator';
import { Subject } from 'rxjs';

import { InternalDialogRef } from '../dialog-ref';
import { DialogComponent } from '../dialog.component';
import { DialogService } from '../dialog.service';
import { DialogDraggableDirective } from '../draggable.directive';
import { NODES_TO_INSERT } from '../providers';
import { CloseStrategy, DialogConfig, GlobalDialogConfig } from '../types';

describe('DialogComponent', () => {
  const defaultConfig: Partial<DialogConfig & GlobalDialogConfig> = {
    id: 'test',
    container: document.body,
    backdrop: true,
    enableClose: true,
    draggable: false,
    resizable: false,
    size: 'md',
    windowClass: undefined,
    sizes: undefined,
    width: undefined,
    height: undefined,
    data: undefined,
    vcr: undefined,
  };

  let config = defaultConfig;
  function setConfig(inline: Partial<DialogConfig> = {}) {
    config = { ...defaultConfig, ...inline };
  }

  let spectator: Spectator<DialogComponent>;

  const createComponent = createComponentFactory({
    component: DialogComponent,
    imports: [DialogDraggableDirective],
    providers: [
      {
        provide: InternalDialogRef,
        useFactory: () => ({
          close: jasmine.createSpy(),
          backdropClick$: new Subject(),
          get config() {
            return config;
          },
        }),
      },
      {
        provide: NODES_TO_INSERT,
        useValue: [document.createTextNode('nodes '), document.createTextNode('inserted')],
      },
    ],
  });

  beforeEach(() => {
    setConfig();
  });

  afterEach(() => {
    const containerEls = document.querySelectorAll('.ngneat-dialog-content');
    const backdropEls = document.querySelectorAll('.ngneat-dialog-backdrop');

    [...Array.from(containerEls), ...Array.from(backdropEls)].filter(Boolean).forEach((el) => el.remove());
  });

  it('should create', () => {
    spectator = createComponent();
    expect(spectator.component).toBeTruthy();
  });

  it('should set id in its host', () => {
    setConfig({ id: 'test' });
    spectator = createComponent();

    spectator.detectChanges();

    expect(spectator.element.id).toBe('test');
  });

  it('should place nodes into dialog-content', () => {
    spectator = createComponent();

    expect(spectator.query(byText('nodes inserted'))).toBeTruthy();
  });

  describe('when backdrop is enabled', () => {
    beforeEach(() => {
      setConfig({ backdrop: true });
      spectator = createComponent();
    });

    it('should create backdrop div, and set its class', () => {
      expect(spectator.query('.ngneat-dialog-backdrop')).toBeTruthy();
    });

    it('backdropClick$ should point to element', () => {
      let backdropClicked = false;
      spectator.inject(InternalDialogRef).backdropClick$.subscribe({
        next: () => (backdropClicked = true),
      });

      spectator.dispatchMouseEvent('.ngneat-dialog-backdrop', 'click');

      expect(backdropClicked).toBeTrue();
    });
  });

  describe('when backdrop is disabled', () => {
    beforeEach(() => {
      setConfig({ backdrop: false });
      spectator = createComponent();
    });

    it('should create backdrop div, and set its class', () => {
      expect(spectator.query('.ngneat-dialog-backdrop')).toBeHidden();
    });

    it('backdropClick$ should point to body', () => {
      let backdropClicked = false;
      spectator.inject(InternalDialogRef).backdropClick$.subscribe({
        next: () => (backdropClicked = true),
      });

      spectator.dispatchMouseEvent(document.body, 'click');

      expect(backdropClicked).toBeTrue();
    });
  });

  describe('enableClose', () => {
    const closeStrategies: CloseStrategy[] = [true, false, 'onlyLastStrategy'];
    const dialogPositions = <const>['only', 'last', 'not-last'];
    const cases: {
      _value: DialogConfig['enableClose'];
      _position: (typeof dialogPositions)[keyof typeof dialogPositions];
      backdrop: CloseStrategy;
      escape: CloseStrategy;
    }[] = [
      ...closeStrategies.map((_value) => ({
        _value,
        escape: _value,
        backdrop: _value,
      })),
      ...closeStrategies.flatMap((escape) =>
        closeStrategies.map((backdrop) => ({
          _value: { escape, backdrop },
          escape,
          backdrop,
        })),
      ),
    ].flatMap((context) =>
      dialogPositions.map((pos) => ({
        _value: context._value,
        _position: pos,
        backdrop: context.backdrop === 'onlyLastStrategy' ? pos !== 'not-last' : context.backdrop,
        escape: context.escape === 'onlyLastStrategy' ? pos !== 'not-last' : context.escape,
      })),
    );
    cases.forEach(({ _value, _position, backdrop, escape }) => {
      describe(`set to ${JSON.stringify(_value)}`, () => {
        describe(`as the ${_position} dialog`, () => {
          let dialogService: SpyObject<DialogService>;
          beforeEach(() => {
            setConfig({ enableClose: _value, id: 'close-last-open-dialog' });
            spectator = createComponent();
            dialogService = spectator.inject(DialogService);
            dialogService.dialogs.push(Object.assign(spectator.component.dialogRef, { id: 'close-last-open-dialog' }));
            if (_position === 'last') dialogService.dialogs.splice(0, 0, { id: 'first-dialog' } as InternalDialogRef);
            if (_position === 'not-last') dialogService.dialogs.push({ id: 'last-dialog' } as InternalDialogRef);
          });
          if (backdrop !== false)
            it('should call close on backdrop click', () => {
              const { close } = spectator.inject(InternalDialogRef);
              spectator.dispatchMouseEvent('.ngneat-dialog-content', 'click');
              expect(close).not.toHaveBeenCalled();
              spectator.dispatchMouseEvent(document.body, 'click');
              expect(close).not.toHaveBeenCalled();
              spectator.dispatchMouseEvent('.ngneat-dialog-backdrop', 'click');
              expect(close).toHaveBeenCalled();
            });
          else
            it('should not call close on backdrop click', () => {
              const { close } = spectator.inject(InternalDialogRef);
              spectator.dispatchMouseEvent('.ngneat-dialog-content', 'click');
              expect(close).not.toHaveBeenCalled();
              spectator.dispatchMouseEvent(document.body, 'click');
              expect(close).not.toHaveBeenCalled();
              spectator.dispatchMouseEvent('.ngneat-dialog-backdrop', 'click');
              expect(close).not.toHaveBeenCalled();
            });
          if (escape !== false)
            it('should call close on escape', () => {
              const { close } = spectator.inject(InternalDialogRef);
              spectator.dispatchKeyboardEvent(document.body, 'keyup', 'Enter');
              expect(close).not.toHaveBeenCalled();
              spectator.dispatchKeyboardEvent(document.body, 'keyup', 'Escape');
              expect(close).toHaveBeenCalled();
            });
          else
            it('should not call close on escape', () => {
              const { close } = spectator.inject(InternalDialogRef);
              spectator.dispatchKeyboardEvent(document.body, 'keyup', 'Escape');
              expect(close).not.toHaveBeenCalled();
            });
        });
      });
    });
  });

  describe('when draggable is enabled', () => {
    beforeEach(() => {
      setConfig({ draggable: true });
      spectator = createComponent();
    });

    it('should show draggable marker and instance draggable directive', () => {
      expect(spectator.query('.ngneat-drag-marker')).toBeTruthy();
      expect(spectator.query(DialogDraggableDirective)).toBeTruthy();
    });
  });

  describe('when draggable is disabled', () => {
    beforeEach(() => {
      setConfig({ draggable: false });
      spectator = createComponent();
    });

    it('should not show draggable marker and not instance draggable directive', () => {
      expect(spectator.query('.ngneat-drag-marker')).toBeFalsy();
      expect(spectator.query(DialogDraggableDirective)).toBeFalsy();
    });
  });

  it('when resizable is enabled should set its class', () => {
    setConfig({ resizable: true });
    spectator = createComponent();

    expect(spectator.query('.ngneat-dialog-resizable')).toBeTruthy();
  });

  it('should set windowClass at host element', () => {
    setConfig({ windowClass: 'this-is-a-test-class' });
    spectator = createComponent();

    const host = spectator.query('.this-is-a-test-class', { root: true });

    expect(host).toBeTruthy();
    expect(host).toBe(spectator.fixture.nativeElement);
  });

  it('should set multiple classes from windowClass at host element', () => {
    setConfig({ windowClass: ' test-class-1 test-class-2 ' });
    spectator = createComponent();

    const host = spectator.query('.test-class-1.test-class-2', { root: true });

    expect(host).toBeTruthy();
    expect(host).toBe(spectator.fixture.nativeElement);
  });

  it('should add a role attribute to the dialog', () => {
    spectator = createComponent();

    expect(spectator.query('[role=dialog]')).toBeTruthy();
  });
});
