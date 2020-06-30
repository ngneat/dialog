import { Component, ViewChild, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { interval } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { DialogService, DialogConfig, DialogRef } from '@ngneat/dialog';

import { TestDialogComponent } from './test-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [
    `
      .note {
        background-color: #ffffcc;
        padding: 16px 32px;
      }

      .dialog {
        padding: 18px;
      }

      label {
        padding: 0em 0.75em;
        width: 200px;
        display: inline-block;
      }

      input,
      select {
        padding: 0.5em 0.75em;
        width: 200px;
      }

      button {
        margin-right: 10px;
      }

      form {
        max-height: 220px;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: flex-start;
      }

      form > div {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        height: 32px;
      }
    `
  ]
})
export class AppComponent {
  @ViewChild('template', { static: true })
  template: TemplateRef<any>;

  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr: ViewContainerRef;

  component = TestDialogComponent;

  config = this.fb.group({
    id: [''],
    height: [''],
    width: [''],
    enableClose: [true],
    closeButton: [true],
    backdrop: [true],
    resizable: [false],
    draggable: [false],
    size: [''],
    windowClass: ['']
  } as Partial<Record<keyof DialogConfig, any>>);

  builtIn = this.fb.group({
    type: ['confirm'],
    title: ['Test dialog 🔨'],
    body: ['This is the body for my dialog and it can contain <b>HTML</b>!']
  });

  data = this.fb.group({
    title: ['My awesone custom title! :-D'],
    withResult: [true]
  });

  cleanConfig: Partial<DialogConfig>;

  result: any;

  messageFromDialog: string;

  closeOnce = false;

  templateOfCustomVCRIsAttached = true;

  timer$ = interval(1000).pipe(shareReplay(1));

  backDropClicked = false;

  constructor(private fb: FormBuilder, public dialog: DialogService) {}

  openDialog(compOrTemplate: Type<any> | TemplateRef<any>, config: DialogConfig) {
    this.backDropClicked = false;
    this.cleanConfig = this.clearConfig(config);

    const ref = this.dialog.open(compOrTemplate, this.cleanConfig);

    ref.backdropClick$.subscribe({
      next: () => (this.backDropClicked = true)
    });

    return ref;
  }

  openBuiltIn({ type, ...content }: { type: string; title: string; body: string }, config: DialogConfig) {
    this.cleanConfig = this.clearConfig(config);

    (this.dialog[type](content, this.cleanConfig) as DialogRef).afterClosed$.subscribe({
      next: result => (this.result = result)
    });
  }

  openDialogWithCustomContainer(
    compOrTemplate: Type<any> | TemplateRef<any>,
    container: HTMLElement,
    config: DialogConfig
  ) {
    this.openDialog(compOrTemplate, {
      ...config,
      container
    });
  }

  openDialogWithCustomVCR(compOrTemplate: Type<any> | TemplateRef<any>, config: DialogConfig) {
    this.templateOfCustomVCRIsAttached = true;

    this.openDialog(compOrTemplate, {
      ...config,
      vcr: this.vcr
    });
  }

  toggleDialogFromVCR() {
    const view = this.vcr.get(0);

    if (this.templateOfCustomVCRIsAttached) {
      view.detach();
    } else {
      view.reattach();
    }

    this.templateOfCustomVCRIsAttached = !this.templateOfCustomVCRIsAttached;
  }

  detectChangesIntoDialog() {
    const view = this.vcr.get(0);
    view.detectChanges();
  }

  openDialogWithGuard(compOrTemplate: Type<any> | TemplateRef<any>, config: DialogConfig) {
    this.closeOnce = false;

    const ref = this.openDialog(compOrTemplate, config);

    ref.beforeClose(() =>
      this.dialog
        .confirm({
          title: 'Are you sure?',
          body: 'Are you really really sure you want close this awesome test dialog?'
        })
        .afterClosed$.pipe(tap(close => (this.closeOnce = !close)))
    );
  }

  openDialogWithCustomData(compOrTemplate: Type<any> | TemplateRef<any>, data: object, config: DialogConfig) {
    this.openDialog(compOrTemplate, {
      ...config,
      data
    }).afterClosed$.subscribe({
      next: (message?: string) => {
        if (typeof message === 'string') {
          this.messageFromDialog = message;
        }
      }
    });
  }

  private clearConfig(config: DialogConfig) {
    return Object.keys(config).reduce((acc, key) => {
      acc[key] = config[key] === '' ? undefined : config[key];

      return acc;
    }, {});
  }
}
