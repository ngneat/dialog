import { Provider } from '@angular/core';
import { byText, createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator';
import { Subject } from 'rxjs';
import { InternalDialogRef } from '../dialog-ref';
import { DialogComponent } from '../dialog.component';
import { DialogService } from '../dialog.service';
import { DialogDraggableDirective } from '../draggable.directive';
import { DIALOG_CONFIG, NODES_TO_INSERT } from '../providers';
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

  function withConfig(config: Partial<DialogConfig> = {}): { providers: Provider[] } {
    return {
      providers: [
        {
          provide: DIALOG_CONFIG,
          useValue: { ...defaultConfig, ...config },
        },
      ],
    };
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
        }),
      },
      {
        provide: NODES_TO_INSERT,
        useValue: [document.createTextNode('nodes '), document.createTextNode('inserted')],
      },
    ],
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
    spectator = createComponent(withConfig({ id: 'test' }));

    spectator.detectChanges();

    expect(spectator.element.id).toBe('test');
  });

  it('should place nodes into dialog-content', () => {
    spectator = createComponent();

    expect(spectator.query(byText('nodes inserted'))).toBeTruthy();
  });

  describe('when backdrop is enabled', () => {
    beforeEach(() => (spectator = createComponent(withConfig({ backdrop: true }))));

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
    beforeEach(() => (spectator = createComponent(withConfig({ backdrop: false }))));

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
      _position: typeof dialogPositions[keyof typeof dialogPositions];
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
        }))
      ),
    ].flatMap((context) =>
      dialogPositions.map((pos) => ({
        _value: context._value,
        _position: pos,
        backdrop: context.backdrop === 'onlyLastStrategy' ? pos !== 'not-last' : context.backdrop,
        escape: context.escape === 'onlyLastStrategy' ? pos !== 'not-last' : context.escape,
      }))
    );
    cases.forEach(({ _value, _position, backdrop, escape }) => {
      describe(`set to ${JSON.stringify(_value)}`, () => {
        describe(`as the ${_position} dialog`, () => {
          let dialogService: SpyObject<DialogService>;
          beforeEach(() => {
            spectator = createComponent(withConfig({ enableClose: _value, id: 'close-last-open-dialog' }));
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

  describe('config update', () => {
    beforeEach(() => {
      spectator = createComponent(withConfig({ enableClose: true }));
    });

    it('should properly update draggable in config', () => {
      expect(spectator.component.config.draggable).toBeFalse();
      spectator.component.updateDialogConfig({ draggable: true });
      expect(spectator.component.config.draggable).toBeTruthy();
    });

    it('should properly update size and id in config', () => {
      expect(spectator.component.config.id).toBe('test');
      expect(spectator.component.config.size).toBe('md');
      spectator.component.updateDialogConfig({ size: 'lg', id: 'unique' });
      expect(spectator.component.config.id).toBe('unique');
      expect(spectator.component.config.size).toBe('lg');
    });

    it('should properly update width and enableClose in config', () => {
      expect(spectator.component.config.enableClose).toBeTruthy();
      expect(spectator.component.config.width).toBe(undefined);
      spectator.component.updateDialogConfig({ width: '200px', enableClose: false });
      expect(spectator.component.config.enableClose).toBeFalse();
      expect(spectator.component.config.width).toBe('200px');
    });
  });

  describe('when draggable is enabled', () => {
    beforeEach(() => (spectator = createComponent(withConfig({ draggable: true }))));

    it('should show draggable marker and instance draggable directive', () => {
      expect(spectator.query('.ngneat-drag-marker')).toBeTruthy();
      expect(spectator.query(DialogDraggableDirective)).toBeTruthy();
    });
  });

  describe('when draggable is disabled', () => {
    beforeEach(() => (spectator = createComponent(withConfig({ draggable: false }))));

    it('should not show draggable marker and not instance draggable directive', () => {
      expect(spectator.query('.ngneat-drag-marker')).toBeFalsy();
      expect(spectator.query(DialogDraggableDirective)).toBeFalsy();
    });
  });

  it('when resizable is enabled should set its class', () => {
    spectator = createComponent(withConfig({ resizable: true }));

    expect(spectator.query('.ngneat-dialog-resizable')).toBeTruthy();
  });

  it('should set windowClass at host element', () => {
    spectator = createComponent(withConfig({ windowClass: 'this-is-a-test-class' }));

    const host = spectator.query('.this-is-a-test-class', { root: true });

    expect(host).toBeTruthy();
    expect(host).toBe(spectator.fixture.nativeElement);
  });

  it('should set multiple classes from windowClass at host element', () => {
    spectator = createComponent(withConfig({ windowClass: ' test-class-1 test-class-2 ' }));

    const host = spectator.query('.test-class-1.test-class-2', { root: true });

    expect(host).toBeTruthy();
    expect(host).toBe(spectator.fixture.nativeElement);
  });

  it('should add a role attribute to the dialog', () => {
    spectator = createComponent();

    expect(spectator.query('[role=dialog]')).toBeTruthy();
  });
});
