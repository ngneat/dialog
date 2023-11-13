import { ComponentRef, ElementRef, TemplateRef, ViewContainerRef, ViewRef } from '@angular/core';

import { DialogRef } from './dialog-ref';

type Sizes = 'sm' | 'md' | 'lg' | 'fullScreen' | string;
export type DragConstraint = 'none' | 'bounce' | 'constrain';
export type CloseStrategy = boolean | 'onlyLastStrategy';

export interface GlobalDialogConfig {
  sizes: Partial<
    Record<
      Sizes,
      {
        width?: string | number;
        minWidth?: string | number;
        maxWidth?: string | number;
        height?: string | number;
        minHeight?: string | number;
        maxHeight?: string | number;
      }
    >
  >;
  backdrop: boolean;
  container: ElementRef<Element> | Element;
  closeButton: boolean;
  draggable: boolean;
  dragConstraint: DragConstraint;
  enableClose:
    | CloseStrategy
    | {
        escape: CloseStrategy;
        backdrop: CloseStrategy;
      };
  resizable: boolean;
  width: string | number;
  minWidth: string | number;
  maxWidth: string | number;
  height: string | number;
  minHeight: string | number;
  maxHeight: string | number;
  size: Sizes;
  windowClass: string;
  zIndexGetter?(): number;
  onOpen: () => void | undefined;
  onClose: () => void | undefined;
}

export interface DialogConfig<Data = any> extends Omit<GlobalDialogConfig, 'sizes'> {
  id: string;
  data: Data;
  vcr: ViewContainerRef;
}

export type JustProps<T extends object> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
  }[keyof T]
>;

export type ExtractRefProp<T> = NonNullable<
  {
    [P in keyof T]: T[P] extends DialogRef ? P : never;
  }[keyof T]
>;

export type ExtractData<T> = ExtractRefProp<T> extends never
  ? any
  : T[ExtractRefProp<T>] extends DialogRef<infer Data>
  ? Data
  : never;
export type ExtractResult<T> = ExtractRefProp<T> extends never
  ? any
  : T[ExtractRefProp<T>] extends DialogRef<any, infer Result>
  ? Result
  : never;

export interface AttachOptions {
  ref: ComponentRef<any> | TemplateRef<any>;
  view: ViewRef;
  attachToApp: boolean;
}
