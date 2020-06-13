import {
  Component,
  ViewChild,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  ViewRef,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Subject, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DialogRef } from './dialog-ref';
import { DialogConfig } from './config';
import { DIALOG_CONFIG, VIEW_TO_INSERT } from './tokens';

@Component({
  selector: 'ngneat-dialog',
  template: `
    <div #backdrop *ngIf="config.backdrop" [class.ngneat-dialog-backdrop]="config.backdrop"></div>

    <div
      #dialogElement
      class="ngneat-dialog-content {{ config.windowClass }}"
      [class.ngneat-dialog-fullscreen]="config.fullScreen"
      [ngStyle]="size"
      style="transform: translate(-50%, -50%);"
      cdkDrag
      [cdkDragDisabled]="!config.draggable"
    >
      <svg
        *ngIf="config.draggable"
        cdkDragHandle
        class="ngneat-drag-marker"
        width="24px"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"
        ></path>
        <path d="M0 0h24v24H0z" fill="none"></path>
      </svg>
      <ng-container #dialogContainer></ng-container>
    </div>
  `,
  styleUrls: [`./dialog.component.scss`],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit, OnDestroy {
  size = {
    ...this.config.sizes?.[this.config.size],
    ...{
      width: this.config.width,
      height: this.config.height
    }
  };

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
