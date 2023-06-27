import { ComponentRef, TemplateRef } from '@angular/core';
import { from, merge, Observable, of, Subject } from 'rxjs';
import { defaultIfEmpty, filter, first } from 'rxjs/operators';

import { DialogConfig, JustProps } from './types';
import { DragOffset } from './draggable.directive';

type GuardFN<R> = (result?: R) => Observable<boolean> | Promise<boolean> | boolean;

export abstract class DialogRef<
  Data = any,
  Result = any,
  Ref extends ComponentRef<any> | TemplateRef<any> = ComponentRef<any> | TemplateRef<any>
> {
  public ref: Ref;
  public id: string;
  public data: Data;

  public backdropClick$: Observable<MouseEvent>;
  public afterClosed$: Observable<Result | undefined>;

  abstract close(result?: Result): void;
  abstract beforeClose(guard: GuardFN<Result>): void;
  abstract resetDrag(offset?: DragOffset): void;
}

export class InternalDialogRef extends DialogRef {
  public backdropClick$: Subject<MouseEvent>;

  beforeCloseGuards: GuardFN<unknown>[] = [];

  constructor(props: Partial<JustProps<InternalDialogRef>> = {}) {
    super();
    this.mutate(props);
  }

  onClose: (result?: unknown) => void;
  onReset: (offset?: DragOffset) => void;
  updateDialogConfig: (dialogConfig: Partial<Omit<DialogConfig, 'data'>>) => void;

  close(result?: unknown): void {
    this.canClose(result)
      .pipe(filter<boolean>(Boolean))
      .subscribe({ next: () => this.onClose(result) });
  }

  beforeClose(guard: GuardFN<unknown>) {
    this.beforeCloseGuards.push(guard);
  }

  resetDrag(offset?: DragOffset) {
    this.onReset(offset);
  }

  canClose(result: unknown): Observable<boolean> {
    const guards$ = this.beforeCloseGuards
      .map((guard) => guard(result))
      .filter((value) => value !== undefined && value !== true)
      .map((value) => {
        return typeof value === 'boolean' ? of(value) : from(value).pipe(filter((canClose) => !canClose));
      });

    return merge(...guards$).pipe(defaultIfEmpty(true), first());
  }

  mutate(props: Partial<InternalDialogRef>) {
    Object.assign(this, props);
  }

  asDialogRef(): DialogRef {
    return this;
  }
}
