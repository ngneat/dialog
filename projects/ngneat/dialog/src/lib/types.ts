import { TemplateRef } from '@angular/core';

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
