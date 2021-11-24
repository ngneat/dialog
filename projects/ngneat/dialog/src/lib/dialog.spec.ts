import { Provider, Component, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { Subject } from 'rxjs';

import { DialogConfig } from './config';
import { DIALOG_CONFIG } from './tokens';
import { DialogDraggableDirective } from './draggable.directive';
import { DialogService } from './dialog.service';
import { DialogModule } from './dialog.module';

describe('Dialog', () => {
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
    selector: 'test-dialog',
    template: '<button id="closeUsingDialog" [dialogClose]="true">Close using dialogClose</button>'
  })
  class TestDialogClosableUsingDialogCloseComponent {}

  @Component({
    template: `
      <ng-template #tmpl>
        <div id="tmpl">
          template dialog
          <!-- {{ tmplChanges$ | async }} -->
        </div>
      </ng-template>
      <div id="otherVCR" #otherVCR></div>

      <ng-template #usingDialogClose>
        <button id="closeUsingDialog" [dialogClose]="true">Close using dialogClose</button>
      </ng-template>

      <ng-template #usingDialogCloseWithoutResult>
        <button id="closeUsingDialog" dialogClose>Close using dialogClose</button>
      </ng-template>
    `
  })
  class TestComponent {
    @ViewChild('otherVCR', { read: ViewContainerRef })
    otherVCR: ViewContainerRef;

    @ViewChild('tmpl')
    tmpl: TemplateRef<any>;

    @ViewChild('usingDialogClose')
    tmplWithDialogClose: TemplateRef<any>;

    @ViewChild('usingDialogCloseWithoutResult')
    tmplWithDialogCloseWithoutResult: TemplateRef<any>;

    tmplChanges$ = new Subject<string>();

    constructor(public dialog: DialogService) {}
  }

  let spectator: Spectator<TestComponent>;

  const createComponent = createComponentFactory({
    component: TestComponent,
    declarations: [DialogDraggableDirective, TestDialogComponent, TestDialogClosableUsingDialogCloseComponent],
    imports: [DialogModule.forRoot()]
  });

  afterEach(() => {
    const dialogEls = document.querySelectorAll('ngneat-dialog');

    Array.from(dialogEls)
      .filter(Boolean)
      .forEach(el => el.remove());
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

  it('should be able of subscribe to afterClosed$ and backdropClick$', () => {
    spectator = createComponent();
    const { component } = spectator;

    const dialogRef = component.dialog.open(component.tmpl);

    expect(() => dialogRef.afterClosed$.subscribe()).not.toThrow();
    expect(() => dialogRef.backdropClick$.subscribe()).not.toThrow();
  });

  it('should open dialog with a component', () => {
    spectator = createComponent();
    const { component } = spectator;

    component.dialog.open(TestDialogComponent);

    spectator.detectChanges();

    expect(document.querySelector('test-dialog')).toContainText('component dialog');
  });

  describe('built-in dialogs', () => {
    let component: TestComponent;
    let service: DialogService;

    beforeEach(() => {
      spectator = createComponent();
      component = spectator.component;
      service = component.dialog;
    });

    ['confirm', 'error', 'success'].forEach(method => {
      describe(method, () => {
        describe(`should open it`, () => {
          it('using a ng-template', () => {
            service[method](component.tmpl);

            spectator.detectChanges();

            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(spectator.query('.dialog-content', { root: true })).toContainText('template dialog');
          });

          it('apending HTML', () => {
            service[method]('<div>test</div>');

            spectator.detectChanges();

            const content = spectator.query('.dialog-content', { root: true });
            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(content.firstElementChild.innerHTML).toBe('<div>test</div>');
          });

          it('using a string', () => {
            service[method]('content is a string');

            spectator.detectChanges();

            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(spectator.query('.dialog-content', { root: true })).toContainText('content is a string');
          });
        });

        describe('should show title and body', () => {
          it('using an ng-template', () => {
            service[method]({
              title: component.tmpl,
              body: component.tmpl
            });

            spectator.detectChanges();

            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(spectator.query('.dialog-header', { root: true })).toContainText('template dialog');
            expect(spectator.query('.dialog-content', { root: true })).toContainText('template dialog');
          });

          it('appending HTML', () => {
            service[method]({
              title: '<div>title into a div</div>',
              body: '<div>content into a div</div>'
            });

            spectator.detectChanges();

            const title = spectator.query('.dialog-header', { root: true });
            const body = spectator.query('.dialog-content', { root: true });

            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(title.lastElementChild.innerHTML).toBe('<div>title into a div</div>');
            expect(body.firstElementChild.innerHTML).toBe('<div>content into a div</div>');
          });

          it('using a string', () => {
            service[method]({
              title: 'title is a string',
              body: 'content is a string'
            });

            spectator.detectChanges();

            expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeTruthy();
            expect(spectator.query('.dialog-header', { root: true })).toContainText('title is a string');
            expect(spectator.query('.dialog-content', { root: true })).toContainText('content is a string');
          });
        });

        it('should close it', () => {
          service[method]('test');
          spectator.detectChanges();

          spectator.click(spectator.queryLast('.btn', { root: true }));

          expect(spectator.query(`ngneat-dialog-${method}`, { root: true })).toBeFalsy();
        });
      });
    });

    it('confirm should return true if click OK', () => {
      const values = [];
      const dialogRef = service.confirm('test');

      spectator.detectChanges();

      dialogRef.beforeClose(confirmed => {
        values.push(confirmed);

        return true;
      });

      dialogRef.afterClosed$.subscribe({
        next: confirmed => values.push(confirmed)
      });

      spectator.click(spectator.queryLast('.btn-success', { root: true }));

      expect(values).toEqual([true, true]);
    });

    it('confirm should return false if click Cancel', () => {
      const values = [];
      const dialogRef = service.confirm('test');

      spectator.detectChanges();

      dialogRef.beforeClose(confirmed => {
        values.push(confirmed);

        return true;
      });

      dialogRef.afterClosed$.subscribe({
        next: confirmed => values.push(confirmed)
      });

      spectator.click(spectator.queryLast('.btn-cancel', { root: true }));

      expect(values).toEqual([false, false]);
    });
  });

  describe('should close using dialogClose directive', () => {
    it('into a template', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog.open(spectator.component.tmplWithDialogClose).afterClosed$.subscribe({
        next: result => (value = result)
      });

      spectator.detectChanges();

      spectator.click(spectator.query('#closeUsingDialog', { root: true }));

      expect(value).toBeTrue();
    });

    it('into a template without binding return empty string', () => {
      let value = 'should be empty';
      spectator = createComponent();
      spectator.component.dialog.open(spectator.component.tmplWithDialogCloseWithoutResult).afterClosed$.subscribe({
        next: result => (value = result)
      });

      spectator.detectChanges();

      spectator.click(spectator.query('#closeUsingDialog', { root: true }));

      expect(value).toBe('');
    });

    it('into a template using a view container ref', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog
        .open(spectator.component.tmplWithDialogClose, {
          vcr: spectator.component.otherVCR
        })
        .afterClosed$.subscribe({
          next: result => (value = result)
        });

      spectator.detectChanges();

      spectator.click(spectator.query('#closeUsingDialog', { root: true }));

      expect(value).toBeTrue();
    });

    it('into a component', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog.open(TestDialogClosableUsingDialogCloseComponent).afterClosed$.subscribe({
        next: result => (value = result)
      });

      spectator.detectChanges();

      spectator.click(spectator.query('#closeUsingDialog', { root: true }));

      expect(value).toBeTrue();
    });

    it('into a component using a view container ref', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog
        .open(TestDialogClosableUsingDialogCloseComponent, {
          vcr: spectator.component.otherVCR
        })
        .afterClosed$.subscribe({
          next: result => (value = result)
        });

      spectator.detectChanges();

      spectator.click(spectator.query('#closeUsingDialog', { root: true }));

      expect(value).toBeTrue();
    });
  });
});
