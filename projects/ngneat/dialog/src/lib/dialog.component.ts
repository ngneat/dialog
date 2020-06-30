import { Component, ViewChild, ElementRef, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Subject, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { InternalDialogRef } from './dialog-ref';
import { DialogConfig } from './config';
import { DIALOG_CONFIG, NODES_TO_INSERT } from './tokens';

@Component({
  selector: 'ngneat-dialog',
  template: `
    <div
      #backdrop
      class="ngneat-dialog-backdrop"
      [hidden]="!config.backdrop"
      [class.ngneat-dialog-backdrop-visible]="config.backdrop"
    >
      <div #dialog class="ngneat-dialog-content" [class.ngneat-dialog-resizable]="config.resizable" [ngStyle]="styles">
        <div
          *ngIf="config.draggable"
          class="ngneat-drag-marker"
          dialogDraggable
          [dialogDragEnabled]="true"
          [dialogDragTarget]="dialog"
        ></div>
        <div class="ngneat-close-dialog" *ngIf="config.enableClose && config.closeButton" (click)="closeDialog()">
          <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 512.001 512.001"
            xml:space="preserve"
          >
            <path
              fill="currentColor"
              d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717
                L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859
                c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287
                l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285
                L284.286,256.002z"
            />
          </svg>
        </div>
      </div>
    </div>
  `,
  styleUrls: [`./dialog.component.scss`],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit, OnDestroy {
  private size = this.config.sizes?.[this.config.size];
  styles = {
    width: this.config.width || this.size?.width,
    height: this.config.height || this.size?.height,
    minHeight: this.config.minHeight || this.size?.minHeight
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

    public dialogRef: InternalDialogRef,
    @Inject(DIALOG_CONFIG)
    public config: DialogConfig,
    @Inject(NODES_TO_INSERT)
    private nodes: Element[]
  ) {
    host.id = this.config.id;

    // Append nodes to dialog component, template or component could need
    // something from the dialog component
    // for example, if `[dialogClose]` is used into a directive,
    // DialogRef will be getted from DialogService instead of DI
    host.append(...this.nodes);

    if (config.windowClass) {
      host.classList.add(config.windowClass);
    }
  }

  ngOnInit() {
    const backdrop = this.config.backdrop ? this.backdrop.nativeElement : this.document.body;
    const dialogElement = this.dialogElement.nativeElement;

    const backdropClick$ = fromEvent<MouseEvent>(backdrop, 'mouseup').pipe(
      filter(({ target }) => !dialogElement.contains(target as Element))
    );

    backdropClick$.pipe(takeUntil(this.destroy$)).subscribe(this.dialogRef.backdropClick$);

    if (this.config.enableClose) {
      merge(
        fromEvent<KeyboardEvent>(this.document.body, 'keyup').pipe(filter(({ key }) => key === 'Escape')),
        backdropClick$
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.closeDialog());
    }

    // `dialogElement` is resolvesd at this point
    // And here is where dialog finally will be placed
    dialogElement.append(...this.nodes);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.dialogRef = null;
    this.nodes = null;
  }
}
