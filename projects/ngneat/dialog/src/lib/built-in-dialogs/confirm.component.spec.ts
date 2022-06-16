import { Provider } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { BehaviorSubject, Observable, Subject, Subscriber } from 'rxjs';
import { DIALOG_CONFIG, DialogComponent, DialogConfig, DialogContentSymbol, DialogRef } from '@ngneat/dialog';
import { DialogDraggableDirective } from '../draggable.directive';
import { InternalDialogRef } from '../dialog-ref';
import { NODES_TO_INSERT } from '../tokens';
import { ConfirmDialogComponent } from './confirm.component';
import { BaseDialogComponent } from './base.component';

describe('ConfirmComponent', () => {
  const defaultConfig: Partial<DialogConfig> = {
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
    confirm: {
      confirmText: '',
      cancelText: ''
    }
  };

  function withConfig(config: Partial<DialogConfig> = {}): { providers: Provider[] } {
    return {
      providers: [
        {
          provide: DIALOG_CONFIG,
          useValue: { ...defaultConfig, ...config }
        }
      ]
    };
  }

  let spectator: Spectator<ConfirmDialogComponent>;

  const createComponent = createComponentFactory({
    component: ConfirmDialogComponent,
    declarations: [BaseDialogComponent],
    providers: [
      {
        provide: DIALOG_CONFIG,
        useValue: defaultConfig
      },
      {
        provide: DialogRef,
        useValue: {
          data: {
            [DialogContentSymbol]: {
              title: 'title',
              body: 'content'
            }
          }
        }
      },
      {
        provide: NODES_TO_INSERT,
        useValue: [document.createTextNode('nodes '), document.createTextNode('inserted')]
      }
    ]
  });

  afterEach(() => {
    const containerEls = document.querySelectorAll('.ngneat-dialog-content');
    const backdropEls = document.querySelectorAll('.ngneat-dialog-backdrop');

    [...Array.from(containerEls), ...Array.from(backdropEls)].filter(Boolean).forEach(el => el.remove());
  });

  it('should create', () => {
    spectator = createComponent();
    expect(spectator.component).toBeTruthy();
  });

  it('should set the confirm and cancel text', () => {
    spectator = createComponent(withConfig({ confirm: { confirmText: 'Yes', cancelText: 'No' } }));

    spectator.detectChanges();
    const btnCancel = spectator.query('.dialog-footer .btn-cancel');
    const btnSuccess = spectator.query('.dialog-footer .btn-success');

    expect(btnCancel).toHaveText('No');
    expect(btnSuccess).toHaveText('Yes');
  });

  it('should set the confirm text as an observable', () => {
    const subject = new BehaviorSubject('Yes fine');
    spectator = createComponent(withConfig({ confirm: { confirmText: subject.asObservable(), cancelText: 'No' } }));

    spectator.detectChanges();
    const btnSuccess = spectator.query('.dialog-footer .btn-success');
    expect(btnSuccess).toHaveText('Yes fine');
    subject.next('Yeah');
    spectator.detectChanges();
    expect(btnSuccess).toHaveText('Yeah');
  });
});
