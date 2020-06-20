import { ComponentRef, TemplateRef } from '@angular/core';
import { Observable, of, from, merge } from 'rxjs';
import { filter, first, defaultIfEmpty } from 'rxjs/operators';

import { JustProps } from './types';

type GuardFN<R> = (result?: R) => Observable<boolean> | Promise<boolean> | boolean;
type RefType = ComponentRef<any> | TemplateRef<any>;

export abstract class DialogRef<Data = any, Result = any, Ref extends RefType = RefType> {
  public ref: Ref;
  public id: string;
  public data: Data;

  public backdropClick$: Observable<MouseEvent>;
  public afterClosed$: Observable<Result>;

  abstract close(result?: Result): void;
  abstract beforeClose(guard: GuardFN<Result>): void;
}

export class InternalDialogRef extends DialogRef {
  beforeCloseGuards: GuardFN<unknown>[] = [];

  constructor(props: Partial<JustProps<DialogRef>> = {}) {
    super();
    this.mutate(props);
  }

  onClose: (result?: unknown) => void;

  close(result?: unknown): void {
    this.canClose(result)
      .pipe(filter<boolean>(Boolean))
      .subscribe({ next: () => this.onClose(result) });
  }

  beforeClose(guard: GuardFN<unknown>) {
    this.beforeCloseGuards.push(guard);
  }

  canClose(result: unknown): Observable<boolean> {
    const guards$ = this.beforeCloseGuards
      .map(guard => guard(result))
      .filter(value => value !== undefined && value !== true)
      .map(value => {
        return typeof value === 'boolean' ? of(value) : from(value).pipe(filter(canClose => !canClose));
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
