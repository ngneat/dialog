import { Component, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { interval } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { DialogCloseDirective, DialogService, DialogConfig } from '@ngneat/dialog';

import { ResetLocationDialogComponent } from './reset-location-dialog.component';
import { TestDialogComponent } from './test-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ReactiveFormsModule, CommonModule, DialogCloseDirective],
  standalone: true,
  styleUrls: ['./app.component.scss'],
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
    enableClose: this.fb.group({
      escape: [true],
      backdrop: [true],
    }),
    closeButton: [true],
    backdrop: [true],
    resizable: [false],
    draggable: [false],
    dragConstraint: ['none'],
    size: [''],
    windowClass: [''],
  } as Partial<Record<keyof DialogConfig, any>>);

  builtIn = this.fb.group({
    type: ['confirm'],
    title: ['Test dialog 🔨'],
    body: ['This is the body for my dialog and it can contain <b>HTML</b>!'],
  });

  data = this.fb.group({
    title: ['My awesone custom title! :-D'],
    withResult: [true],
  });

  cleanConfig: Partial<DialogConfig>;

  result: any;

  messageFromDialog: string;

  closeOnce = false;

  templateOfCustomVCRIsAttached = true;

  timer$ = interval(1000).pipe(shareReplay(1));

  backDropClicked = false;

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: DialogService,
  ) {}

  openDialog(compOrTemplate: Type<any> | TemplateRef<any>, config: DialogConfig) {
    this.backDropClicked = false;
    this.cleanConfig = this.normalizeConfig(config);

    const ref = this.dialog.open(compOrTemplate as any, this.cleanConfig);

    ref.backdropClick$.subscribe({
      next: () => (this.backDropClicked = true),
    });

    return ref;
  }

  openDialogWithCustomVCR(compOrTemplate: Type<any> | TemplateRef<any>, config: DialogConfig) {
    this.templateOfCustomVCRIsAttached = true;

    this.openDialog(compOrTemplate, {
      ...this.normalizeConfig(config),
      vcr: this.vcr,
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

  openResetLocationDialog(config: DialogConfig) {
    this.openDialog(ResetLocationDialogComponent, { ...config, draggable: true });
  }

  openDialogWithCustomData(compOrTemplate: Type<any> | TemplateRef<any>, data: object, config: DialogConfig) {
    this.openDialog(compOrTemplate, {
      ...config,
      data,
    }).afterClosed$.subscribe({
      next: (message?: string) => {
        if (typeof message === 'string') {
          this.messageFromDialog = message;
        }
      },
    });
  }

  private normalizeConfig(config: Partial<DialogConfig>): any {
    return Object.entries(config).reduce((cleanConfig, [key, value]) => {
      if (value != null && value !== '') {
        cleanConfig[key] = value;
      }
      return cleanConfig;
    }, {});
  }
}
