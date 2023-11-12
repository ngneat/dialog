import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Subject } from 'rxjs';

import { DialogCloseDirective } from '../dialog-close.directive';
import { DialogService } from '../dialog.service';

describe('Dialog', () => {
  @Component({
    selector: 'test-dialog',
    standalone: true,
    template: 'component dialog <!-- {{ changes$ | async }} -->',
  })
  class TestDialogComponent {
    changes$ = new Subject<string>();
  }

  @Component({
    selector: 'test-dialog',
    standalone: true,
    imports: [DialogCloseDirective],
    template: '<button id="closeUsingDialog" [dialogClose]="true">Close using dialogClose</button>',
  })
  class TestDialogClosableUsingDialogCloseComponent {}

  @Component({
    standalone: true,
    imports: [DialogCloseDirective],
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
    `,
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
    imports: [TestDialogComponent, TestDialogClosableUsingDialogCloseComponent],
  });

  afterEach(() => {
    const dialogEls = document.querySelectorAll('ngneat-dialog');

    Array.from(dialogEls)
      .filter(Boolean)
      .forEach((el) => el.remove());
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

  describe('should close using dialogClose directive', () => {
    it('into a template', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog.open(spectator.component.tmplWithDialogClose).afterClosed$.subscribe({
        next: (result) => (value = result),
      });
      spectator.detectChanges();
      spectator.click(spectator.query('#closeUsingDialog', { root: true }));
      expect(value).toBeTrue();
    });
    it('into a template without binding return empty string', () => {
      let value = 'should be empty';
      spectator = createComponent();
      spectator.component.dialog.open(spectator.component.tmplWithDialogCloseWithoutResult).afterClosed$.subscribe({
        next: (result) => (value = result),
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
          vcr: spectator.component.otherVCR,
        })
        .afterClosed$.subscribe({
          next: (result) => (value = result),
        });
      spectator.detectChanges();
      spectator.click(spectator.query('#closeUsingDialog', { root: true }));
      expect(value).toBeTrue();
    });
    it('into a component', () => {
      let value = false;
      spectator = createComponent();
      spectator.component.dialog.open(TestDialogClosableUsingDialogCloseComponent).afterClosed$.subscribe({
        next: (result) => (value = result),
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
          vcr: spectator.component.otherVCR,
        })
        .afterClosed$.subscribe({
          next: (result) => (value = result),
        });
      spectator.detectChanges();
      spectator.click(spectator.query('#closeUsingDialog', { root: true }));
      expect(value).toBeTrue();
    });
  });
});
