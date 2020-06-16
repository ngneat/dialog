import { Component, ViewChild, ElementRef, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Subject, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DialogRef } from './dialog-ref';
import { DialogConfig } from './config';
import { DIALOG_CONFIG, NODES_TO_INSERT } from './tokens';

@Component({
  selector: 'ngneat-dialog',
  template: `
    <div #backdrop [hidden]="!config.backdrop" [class.ngneat-dialog-backdrop]="config.backdrop"></div>

    <div class="ngneat-dialog-container">
      <div
        #dialog
        class="ngneat-dialog-content"
        [class.ngneat-dialog-fullscreen]="config.fullScreen"
        [ngStyle]="styles"
      >
        <svg
          *ngIf="config.draggable"
          class="ngneat-drag-marker"
          width="24px"
          fill="currentColor"
          viewBox="0 0 24 24"
          dialogDraggable
          [dialogDragEnabled]="true"
          [dialogDragTarget]="dialog"
        >
          <path
            d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"
          ></path>
          <path d="M0 0h24v24H0z" fill="none"></path>
        </svg>
      </div>
    </div>
  `,
  styleUrls: [`./dialog.component.scss`],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit, OnDestroy {
  styles = {
    width: this.config.width || this.config.fullScreen || this.config.sizes?.[this.config.size].width,
    height: this.config.height || this.config.fullScreen || this.config.sizes?.[this.config.size].height
  };

  @ViewChild('backdrop', { static: true })
  private backdrop: ElementRef<HTMLDivElement>;

  @ViewChild('dialog', { static: true })
  private dialogElement: ElementRef<HTMLElement>;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    { nativeElement: host }: ElementRef<HTMLElement>,

    private dialogRef: DialogRef,
    @Inject(DIALOG_CONFIG)
    public config: DialogConfig,
    @Inject(NODES_TO_INSERT)
    private nodes: Element[]
  ) {
    if (config.windowClass) {
      host.classList.add(config.windowClass);
    }
  }

  ngOnInit() {
    const backdrop = this.config.backdrop ? this.backdrop.nativeElement : this.document.body;
    const dialogElement = this.dialogElement.nativeElement;

    this.dialogRef.backdropClick$ = fromEvent<MouseEvent>(backdrop, 'mouseup');

    if (this.config.enableClose) {
      merge(
        fromEvent<KeyboardEvent>(this.document.body, 'keyup').pipe(filter(({ key }) => key === 'Escape')),
        this.dialogRef.backdropClick$.pipe(filter(({ target }) => !dialogElement.contains(target as Element)))
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: this.dialogRef.close });
    }

    dialogElement.append(...this.nodes);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.dialogRef = null;
    this.nodes = null;
  }
}
