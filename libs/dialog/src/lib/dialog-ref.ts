import { ComponentRef, TemplateRef } from '@angular/core';
import { from, merge, Observable, of, Subject } from 'rxjs';
import { defaultIfEmpty, filter, first } from 'rxjs/operators';

import { DialogConfig, GlobalDialogConfig, JustProps } from './types';
import { DragOffset } from './draggable.directive';

type GuardFN<R> = (result?: R) => Observable<boolean> | Promise<boolean> | boolean;

export abstract class DialogRef<
  Data = any,
  Result = any,
  Ref extends ComponentRef<any> | TemplateRef<any> = ComponentRef<any> | TemplateRef<any>,
> {
  ref: Ref;
  data: Data;
  id: string;
  backdropClick$: Observable<MouseEvent>;
  afterClosed$: Observable<Result | undefined>;

  abstract close(result?: Result): void;
  abstract beforeClose(guard: GuardFN<Result>): void;
  abstract resetDrag(offset?: DragOffset): void;
  abstract updateConfig(config: Partial<DialogConfig>): void;
}

type InternalDialogRefProps = Partial<
  Omit<JustProps<InternalDialogRef>, 'id' | 'data'> & Pick<InternalDialogRef, 'onClose' | 'onReset'>
>;

export class InternalDialogRef extends DialogRef {
  config: DialogConfig & GlobalDialogConfig;
  backdropClick$: Subject<MouseEvent>;
  beforeCloseGuards: GuardFN<unknown>[] = [];
  onClose: (result?: unknown) => void;
  onReset: (offset?: DragOffset) => void;

  constructor(props: InternalDialogRefProps = {}) {
    super();
    this.mutate(props);
  }

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

  mutate(props: InternalDialogRefProps) {
    Object.assign(this, props);
    this.data = this.config.data;
    this.id = this.config.id;
  }

  updateConfig(config: Partial<DialogConfig & GlobalDialogConfig>) {
    this.mutate({
      config: {
        ...this.config,
        ...config,
      },
    });
  }

  asDialogRef(): DialogRef {
    return this;
  }
}
