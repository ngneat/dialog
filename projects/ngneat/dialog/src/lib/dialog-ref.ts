import { ComponentRef, TemplateRef } from '@angular/core';
import { Observable, of, from, merge } from 'rxjs';
import { filter, first, defaultIfEmpty } from 'rxjs/operators';

type CloseFN<R> = (result?: R) => void;
type GuardFN<R> = (result?: R) => Observable<boolean> | Promise<boolean> | boolean;
type RefType = ComponentRef<any> | TemplateRef<any>;

export abstract class DialogRef<Data = any, Result = any, Ref extends RefType = RefType> {
  public ref: Ref;
  public id: string;
  public data: Data;
  public close: CloseFN<Result>;

  public backdropClick$: Observable<MouseEvent>;
  public afterClosed$: Observable<Result>;

  abstract beforeClose(preventFn: GuardFN<Result>): void;
}

export class InternalDialogRef extends DialogRef {
  beforeCloseGuards: GuardFN<unknown>[] = [];

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

  asDialogRef(): DialogRef {
    return this;
  }
}
