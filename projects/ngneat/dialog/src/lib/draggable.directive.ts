import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnChanges, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { DragConstraint } from './types';

export type DragOffset = {
  x?: number;
  y?: number;
};

@Directive({
  selector: '[dialogDraggable]',
  standalone: true,
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
  @Input()
  dragConstraint: DragConstraint;

  private host = inject(ElementRef);
  private zone = inject(NgZone);

  /** Element to be dragged */
  private target: HTMLElement;
  /** Drag handle */
  private handle: HTMLElement;
  private delta = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private enabled = true;
  private destroy$ = new Subject<void>();

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
        this.handle.style.setProperty('cursor', 'move');
      } else if (this.enabled) {
        this.init();
      }
    }

    if (!this.dialogDragEnabled) {
      this.enabled = false;
      if (this.handle) {
        this.handle.style.setProperty('cursor', '');
      }
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  public reset(offset?: DragOffset): void {
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
        map((event) => ({
          startX: event.clientX,
          startY: event.clientY,
        })),
        switchMap(({ startX, startY }) =>
          mousemove$.pipe(
            map((event) => {
              event.preventDefault();
              this.delta = {
                x: event.clientX - startX,
                y: event.clientY - startY,
              };
              if (this.dragConstraint === 'constrain') {
                this.checkConstraint();
              }
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
          if (this.dragConstraint === 'bounce') {
            this.checkConstraint();
            this.translate();
          }
          this.offset.x += this.delta.x;
          this.offset.y += this.delta.y;
          this.delta = { x: 0, y: 0 };
        });
    });
  }

  private translate() {
    if (this.target) {
      this.zone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          const transform = `translate(${this.translateX}px, ${this.translateY}px)`;
          this.target.style.setProperty('transform', transform);
        });
      });
    }
  }

  private get translateX(): number {
    return this.offset.x + this.delta.x;
  }

  private get translateY(): number {
    return this.offset.y + this.delta.y;
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
      this.handle.style.setProperty('cursor', 'move');
    }

    this.target =
      this.dialogDragTarget instanceof HTMLElement
        ? this.dialogDragTarget
        : document.querySelector(this.dialogDragTarget as string);

    this.setupEvents();

    this.translate();
  }

  private checkConstraint(): void {
    const { width, height } = this.target.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;

    const verticalDistance = this.translateY > 0 ? this.translateY + height / 2 : this.translateY - height / 2;
    const maxVerticalDistance = innerHeight / 2;
    const horizontalDistance = this.translateX > 0 ? this.translateX + width / 2 : this.translateX - width / 2;
    const maxHorizontalDistance = innerWidth / 2;

    // Check if modal crosses the top, bottom, left and right window border respectively
    if (-maxVerticalDistance > verticalDistance) {
      this.delta.y = -maxVerticalDistance + height / 2 - this.offset.y;
    }
    if (maxVerticalDistance < verticalDistance) {
      this.delta.y = maxVerticalDistance - height / 2 - this.offset.y;
    }
    if (-maxHorizontalDistance > horizontalDistance) {
      this.delta.x = -maxHorizontalDistance + width / 2 - this.offset.x;
    }
    if (maxHorizontalDistance < horizontalDistance) {
      this.delta.x = maxHorizontalDistance - width / 2 - this.offset.x;
    }
  }
}
