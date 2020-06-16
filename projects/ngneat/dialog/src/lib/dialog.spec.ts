import { Provider, Component, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { Subject } from 'rxjs';

import { DialogConfig } from './config';
import { DIALOG_CONFIG } from './tokens';
import { DialogDraggableDirective } from './draggable.directive';
import { DialogService } from './dialog.service';
import { DialogModule } from './dialog.module';

describe('Dialog', () => {
  const defaultConfig: DialogConfig = {
    id: 'test',
    container: document.body,
    backdrop: true,
    enableClose: true,
    draggable: false,
    fullScreen: false,
    resizable: false,
    size: 'sm',
    windowClass: undefined,
    sizes: undefined,
    width: undefined,
    height: undefined,
    data: undefined,
    vcr: undefined
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

  @Component({
    selector: 'test-dialog',
    template: 'component dialog <!-- {{ changes$ | async }} -->'
  })
  class TestDialogComponent {
    changes$ = new Subject<string>();
  }

  @Component({
    template: `
      <ng-template #tmpl>
        <div id="tmpl">
          template dialog
          <!-- {{ tmplChanges$ | async }} -->
        </div>
      </ng-template>
      <div id="otherVCR" #otherVCR></div>
    `
  })
  class TestComponent {
    @ViewChild('otherVCR', { read: ViewContainerRef })
    otherVCR: ViewContainerRef;

    @ViewChild('tmpl')
    tmpl: TemplateRef<any>;

    tmplChanges$ = new Subject<string>();

    constructor(public dialog: DialogService) {}
  }

  let spectator: Spectator<TestComponent>;

  const createComponent = createComponentFactory({
    component: TestComponent,
    declarations: [DialogDraggableDirective, TestDialogComponent],
    imports: [DialogModule.forRoot()]
  });

  afterAll(() => {
    const dialogEl = document.querySelector('ngneat-dialog');

    [dialogEl].filter(Boolean).forEach(el => el.remove());
  });

  it('should create it', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });

  it('should open dialog with a template', () => {
    spectator = createComponent();
    const { component } = spectator;

    component.dialog.open(component.tmpl);

    spectator.detectChanges();

    expect(document.querySelector('#tmpl')).toContainText('template dialog');
  });

  it('should open dialog with a component', () => {
    spectator = createComponent();
    const { component } = spectator;

    component.dialog.open(TestDialogComponent);

    spectator.detectChanges();

    expect(document.querySelector('test-dialog')).toContainText('component dialog');
  });

  it('should run change detection');
  it('using a component should use ViewContainerRef injector as parent injector');
  it('using a template should detect changes of ViewContainerRef');
});
