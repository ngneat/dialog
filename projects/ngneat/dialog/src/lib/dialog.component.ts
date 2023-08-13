import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { InternalDialogRef } from './dialog-ref';
import { DialogService } from './dialog.service';
import { coerceCssPixelValue } from './dialog.utils';
import { DialogDraggableDirective, DragOffset } from './draggable.directive';
import { DIALOG_CONFIG, NODES_TO_INSERT } from './providers';
import { DialogConfig } from '@ngneat/dialog';
import { animate, animateChild, group, keyframes, query, state, style, transition, trigger } from '@angular/animations';

export const _defaultParams = {
  params: { enterAnimationDuration: '150ms', exitAnimationDuration: '75ms' },
};

@Component({
  selector: 'ngneat-dialog',
  standalone: true,
  imports: [DialogDraggableDirective, CommonModule],
  animations: [
    trigger('dialogContent', [
      // Note: The `enter` animation transitions to `transform: none`, because for some reason
      // specifying the transform explicitly, causes IE both to blur the dialog content and
      // decimate the animation performance. Leaving it as `none` solves both issues.
      state('void, exit', style({ opacity: 0, transform: 'scale(0.7)' })),
      state('enter', style({ transform: 'none' })),
      transition(
        '* => enter',
        group([
          animate(
            '0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            keyframes([style({ opacity: 0, transform: 'translateX(50px)' }), style({ opacity: 1, transform: 'none' })])
          ),
          query('@*', animateChild(), { optional: true }),
        ]),
        _defaultParams
      ),
      transition(
        '* => void, * => exit',
        group([
          animate('0.4s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 })),
          query('@*', animateChild(), { optional: true }),
        ]),
        _defaultParams
      ),
    ]),
    trigger('dialogContainer', [
      transition(
        '* => void, * => exit',
        group([
          animate('0.4s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 })),
          query('@*', animateChild(), { optional: true }),
        ]),
        _defaultParams
      ),
    ]),
  ],
  host: {
    '[@dialogContainer]': `this.dialogRef._getAnimationState()`,
    '(@dialogContainer.start)': '_onAnimationStart($event)',
    '(@dialogContainer.done)': '_onAnimationDone($event)',
  },
  template: `
    <div
      #backdrop
      class="ngneat-dialog-backdrop"
      [hidden]="!config.backdrop"
      [class.ngneat-dialog-backdrop-visible]="config.backdrop"
    >
      <div
        #dialog
        [@dialogContent]="this.dialogRef._getAnimationState()"
        (@dialogContent.start)="_onAnimationStart($event)"
        (@dialogContent.done)="_onAnimationDone($event)"
        class="ngneat-dialog-content"
        [class.ngneat-dialog-resizable]="config.resizable"
        [ngStyle]="styles"
        role="dialog"
      >
        <div
          *ngIf="config.draggable"
          class="ngneat-drag-marker"
          dialogDraggable
          [dialogDragEnabled]="true"
          [dialogDragTarget]="dialog"
          [dragConstraint]="config.dragConstraint"
        ></div>
        <div class="ngneat-close-dialog" *ngIf="config.closeButton" (click)="closeDialog()">
          <svg viewBox="0 0 329.26933 329" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"
            />
          </svg>
        </div>
      </div>
    </div>
  `,
  styleUrls: [`./dialog.component.scss`],
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent implements OnInit, OnDestroy {
  _animationStateChanged = new EventEmitter<{ state: string; totalTime: number }>();
  config = inject(DIALOG_CONFIG);
  dialogRef = inject(InternalDialogRef);

  private size = this.config.sizes?.[this.config.size || 'md'];
  styles = {
    width: coerceCssPixelValue(this.config.width || this.size?.width),
    minWidth: coerceCssPixelValue(this.config.minWidth || this.size?.minWidth),
    maxWidth: coerceCssPixelValue(this.config.maxWidth || this.size?.maxWidth),
    height: coerceCssPixelValue(this.config.height || this.size?.height),
    minHeight: coerceCssPixelValue(this.config.minHeight || this.size?.minHeight),
    maxHeight: coerceCssPixelValue(this.config.maxHeight || this.size?.maxHeight),
  };

  @ViewChild('backdrop', { static: true })
  private backdrop: ElementRef<HTMLDivElement>;

  @ViewChild('dialog', { static: true })
  private dialogElement: ElementRef<HTMLElement>;

  @ViewChild(DialogDraggableDirective, { static: false })
  private draggable: DialogDraggableDirective;

  private destroy$ = new Subject<void>();

  private nodes = inject(NODES_TO_INSERT);

  private document = inject(DOCUMENT);
  private host: HTMLElement = inject(ElementRef).nativeElement;

  private dialogService = inject(DialogService);

  constructor() {
    this.host.id = this.config.id;

    // Append nodes to dialog component, template or component could need
    // something from the dialog component
    // for example, if `[dialogClose]` is used into a directive,
    // DialogRef will be getted from DialogService instead of DI
    this.nodes.forEach((node) => this.host.appendChild(node));

    if (this.config.windowClass) {
      const classNames = this.config.windowClass.split(/\s/).filter((x) => x);
      classNames.forEach((name) => this.host.classList.add(name));
    }
  }

  ngOnInit() {
    const dialogElement = this.dialogElement.nativeElement;
    this.evaluateConfigBasedFields();

    // `dialogElement` is resolved at this point
    // And here is where dialog finally will be placed
    this.nodes.forEach((node) => dialogElement.appendChild(node));
    this.dialogRef._state = 'enter';
  }

  private evaluateConfigBasedFields(): void {
    const backdrop = this.config.backdrop ? this.backdrop.nativeElement : this.document.body;
    const dialogElement = this.dialogElement.nativeElement;

    const backdropClick$ = fromEvent<MouseEvent>(backdrop, 'click', { capture: true }).pipe(
      filter(({ target }) => !dialogElement.contains(target as Element))
    );

    backdropClick$.pipe(takeUntil(this.destroy$)).subscribe(this.dialogRef.backdropClick$);

    // backwards compatibility with non-split option
    const closeConfig =
      typeof this.config.enableClose === 'boolean' || this.config.enableClose === 'onlyLastStrategy'
        ? {
            escape: this.config.enableClose,
            backdrop: this.config.enableClose,
          }
        : this.config.enableClose;
    merge(
      fromEvent<KeyboardEvent>(this.document.body, 'keyup').pipe(
        filter(({ key }) => key === 'Escape'),
        map(() => closeConfig.escape)
      ),
      backdropClick$.pipe(map(() => closeConfig.backdrop))
    )
      .pipe(
        takeUntil(this.destroy$),
        filter((strategy) => {
          if (!strategy) return false;
          if (strategy === 'onlyLastStrategy') {
            return this.dialogService.isLastOpened(this.config.id);
          }
          return true;
        })
      )
      .subscribe(() => this.closeDialog());

    // `dialogElement` is resolved at this point
    // And here is where dialog finally will be placed
    this.nodes.forEach((node) => dialogElement.appendChild(node));

    if (this.config.zIndexGetter) {
      const zIndex = this.config.zIndexGetter().toString();
      backdrop.style.setProperty('--dialog-backdrop-z-index', zIndex);
    }
  }

  _onAnimationStart(event): any {
    if (event.toState === 'enter') {
      this._animationStateChanged.next({ state: 'opening', totalTime: event.totalTime });
    } else if (event.toState === 'exit' || event.toState === 'void') {
      this._animationStateChanged.next({ state: 'closing', totalTime: event.totalTime });
    }
  }

  _onAnimationDone(event) {
    if (event.toState === 'enter') {
      // this._openAnimationDone(totalTime);
    } else if (event.toState === 'exit') {
      this._animationStateChanged.next({ state: 'closed', totalTime: event.totalTime });
    }
  }

  reset(offset?: DragOffset): void {
    if (this.config.draggable) {
      this.draggable.reset(offset);
    }
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
