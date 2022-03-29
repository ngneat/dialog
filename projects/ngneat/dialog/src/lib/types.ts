import { ComponentRef, TemplateRef, Type } from '@angular/core';
import { DialogRef } from './dialog-ref';

export type DialogContentTypes = 'string' | 'template';
export type DialogContent = string | TemplateRef<any>;
export interface DialogTitleAndBody {
  title: DialogContent;
  body: DialogContent;
}

export interface DialogContentWithType {
  type: DialogContentTypes;
  content: DialogContent;
}
export interface DialogTitleAndBodyWithType {
  title: DialogContentWithType;
  body: DialogContentWithType;
}

export const DialogContentSymbol = Symbol('Dialog Content Data');
export interface DialogContentData {
  [DialogContentSymbol]: DialogTitleAndBodyWithType;
}

export type JustProps<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
};

export type ExtractDialogRefData<T extends DialogRef> = T extends DialogRef<infer Data, any, any> ? Data : never;

type _AnyIfUnknown<T> = unknown extends T ? any : T;

export type ExtractDialogRefResult<T extends DialogRef> = T extends DialogRef<any, infer Result, any>
  ? _AnyIfUnknown<Result>
  : never;

export type ExtractDialogRefType<T extends DialogRef> = T extends DialogRef<any, any, infer Type> ? Type : never;

type _ExtractComponentDialogRef<T extends Type<unknown>> = T extends Type<unknown>
  ? TupleExtract<ConstructorParameters<T>, DialogRef<unknown, unknown>>
  : never;

type ExtractComponentDialogRef<T extends Type<unknown>> = _ExtractComponentDialogRef<T> extends [infer U]
  ? U
  : // Any is necessary to not break things: injecting DialogRef in the component constructor is optional.
    any;

export type ComputedDialogRefType<T extends Type<unknown> | TemplateRef<unknown>> = T extends TemplateRef<unknown>
  ? any
  : T extends Type<unknown>
  ? ExtractComponentDialogRef<T>
  : any;

export type ExtractDialogResolvedRef<T extends Type<unknown> | TemplateRef<unknown>> = T extends TemplateRef<unknown>
  ? T
  : T extends Type<infer TComponent>
  ? ComponentRef<TComponent>
  : never;

export type TupleExtract<T extends readonly unknown[], TypeToExtract> = T extends [infer Head, ...(infer Rest)]
  ? [Head] extends [TypeToExtract]
    ? [Head, ...TupleExtract<Rest, TypeToExtract>]
    : TupleExtract<Rest, TypeToExtract>
  : [];
