import {
  Directive,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  ElementRef,
  NgZone,
  EventEmitter,
  Renderer2,
  OnChanges
} from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { filter, switchMap, map, takeUntil } from 'rxjs/operators';

export type DraggedEvent = {
  x: number;
  y: number;
};

export type DragOffset = {
  x?: number;
  y?: number;
};

@Directive({
  selector: '[dialogDraggable]'
})
export class DialogDraggableDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  dialogDragHandle: string | Element;
  @Input()
  dialogDragTarget: string | Element;
  @Input()
  dialogDragEnabled = false;
  @Input()
  set dialogDragOffset(offset: DragOffset) {
    this.reset(offset);
  }
  @Output()
  dragged = new EventEmitter<DraggedEvent>();

  /** Element to be dragged */
  private target: HTMLElement;
  /** Drag handle */
  private handle: Element;
  private delta = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private enabled = true;
  private destroy$ = new Subject<void>();

  constructor(private host: ElementRef, private zone: NgZone, private renderer: Renderer2) {}

  public ngAfterViewInit(): void {
    if (!this.enabled) {
      return;
    }

    this.init();
  }

  public ngOnChanges() {
    if (!this.enabled && this.dialogDragEnabled && this.dialogDragTarget) {
      this.enabled = true;
      /** determine if the component has been init by the handle variable */
      if (this.handle) {
        this.renderer.setStyle(this.handle, 'cursor', 'move');
      } else if (this.enabled) {
        this.init();
      }
    }

    if (!this.dialogDragEnabled) {
      this.enabled = false;
      if (this.handle) {
        this.renderer.setStyle(this.handle, 'cursor', '');
      }
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  reset(offset?: DragOffset) {
    const defaultValues = { x: 0, y: 0 };
    this.offset = { ...defaultValues, ...offset };
    this.delta = { ...defaultValues };
    this.translate();
  }

  private setupEvents() {
    this.zone.runOutsideAngular(() => {
      const mousedown$ = fromEvent<MouseEvent>(this.handle, 'mousedown');
      const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
      const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

      const mousedrag$ = mousedown$.pipe(
        filter(() => this.enabled),
        map(event => ({
          startX: event.clientX,
          startY: event.clientY
        })),
        switchMap(({ startX, startY }) =>
          mousemove$.pipe(
            map(event => {
              event.preventDefault();
              this.delta = {
                x: event.clientX - startX,
                y: event.clientY - startY
              };
            }),
            takeUntil(mouseup$)
          )
        ),
        takeUntil(this.destroy$)
      );

      mousedrag$.subscribe(() => {
        if (this.delta.x === 0 && this.delta.y === 0) {
          return;
        }

        this.translate();
      });

      mouseup$
        .pipe(
          filter(() => this.enabled),
          /** Only emit change if the element has moved */
          filter(() => this.delta.x !== 0 || this.delta.y !== 0),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.offset.x += this.delta.x;
          this.offset.y += this.delta.y;
          this.dragged.emit(this.offset);
          this.delta = { x: 0, y: 0 };
        });
    });
  }

  private translate() {
    if (this.target) {
      this.zone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          const transform = `translate(${this.offset.x + this.delta.x}px, ${this.offset.y + this.delta.y}px)`;
          this.renderer.setStyle(this.target, 'transform', transform);
        });
      });
    }
  }

  /**
   * Init the directive
   */
  private init() {
    if (!this.dialogDragTarget) {
      throw new Error('You need to specify the drag target');
    }

    this.handle =
      this.dialogDragHandle instanceof Element
        ? this.dialogDragHandle
        : typeof this.dialogDragHandle === 'string' && this.dialogDragHandle
        ? document.querySelector(this.dialogDragHandle as string)
        : this.host.nativeElement;

    /** add the move cursor */
    if (this.handle && this.enabled) {
      this.renderer.setStyle(this.handle, 'cursor', 'move');
    }

    this.target =
      this.dialogDragTarget instanceof HTMLElement
        ? this.dialogDragTarget
        : document.querySelector(this.dialogDragTarget as string);

    this.setupEvents();

    this.translate();
  }
}
