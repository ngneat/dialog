import {
  Component,
  ViewChild,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  ViewRef,
  ViewContainerRef,
  InjectionToken
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Subject, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DialogRef } from './dialog-ref';
import { DialogConfig } from './config';

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('Dialog config token');
export const VIEW_TO_INSERT = new InjectionToken<ViewRef>('View inserted into dialog');
export const DIALOG_DATA = new InjectionToken<any>('Dialog data');

@Component({
  selector: 'ngneat-dialog',
  template: `
    <div class="ngneat-dialog">
      <div #backdrop *ngIf="config.backdrop" [class.ngneat-dialog-backdrop]="config.backdrop"></div>

      <div
        #dialogElement
        class="ngneat-dialog-content {{ config.windowClass }}"
        [class.ngneat-dialog-fullscreen]="config.fullScreen"
        [ngStyle]="{ width: config.width, height: config.height }"
      >
        <ng-container #dialogContainer></ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class DialogComponent implements OnInit, OnDestroy {
  @ViewChild('backdrop', { static: true })
  private backdrop: ElementRef<HTMLDivElement>;

  @ViewChild('dialogElement', { static: true })
  private dialogElement: ElementRef<HTMLElement>;

  @ViewChild('dialogContainer', { static: true, read: ViewContainerRef })
  private dialogVCR: ViewContainerRef;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT)
    private document: Document,

    private dialogRef: DialogRef,
    @Inject(DIALOG_CONFIG)
    public config: DialogConfig,
    @Inject(VIEW_TO_INSERT)
    private view: ViewRef
  ) {}

  ngOnInit() {
    const backdrop = this.backdrop?.nativeElement;
    const dialogElement = this.dialogElement.nativeElement;

    this.dialogRef.backdropClick$ = fromEvent<MouseEvent>(backdrop || this.document.body, 'mouseup');

    if (this.config.enableClose) {
      merge(
        fromEvent<KeyboardEvent>(this.document.body, 'keyup').pipe(filter(({ key }) => key === 'Escape')),
        this.dialogRef.backdropClick$.pipe(filter(({ target }) => !dialogElement.contains(target as Element)))
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: this.dialogRef.dispose });
    }

    this.dialogVCR.insert(this.view);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.dialogVCR.clear();

    this.dialogRef = null;
  }
}
