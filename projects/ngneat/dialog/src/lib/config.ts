import { ViewContainerRef, ElementRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

type Sizes = 'sm' | 'md' | 'lg' | 'fullScreen' | string;
export type DragConstraint = 'none' | 'bounce' | 'constrain';

export interface GlobalDialogConfig {
  success: {
    component?: Type<any>;
    confirmText?: string | Observable<string>;
  };
  confirm: {
    component?: Type<any>;
    confirmText?: string | Observable<string>;
    cancelText?: string | Observable<string>;
  };
  error: {
    component?: Type<any>;
    confirmText?: string | Observable<string>;
  };
  sizes: Partial<
    Record<
      Sizes,
      { width?: string | number; height?: string | number; minHeight?: string | number; maxHeight?: string | number }
    >
  >;
  backdrop: boolean;
  container: ElementRef<Element> | Element;
  closeButton: boolean;
  draggable: boolean;
  dragConstraint: DragConstraint;
  enableClose: boolean;
  resizable: boolean;
  width: string | number;
  height: string | number;
  minHeight: string | number;
  maxHeight: string | number;
  size: Sizes;
  windowClass: string;
  onOpen: () => void | undefined;
  onClose: () => void | undefined;
}

export interface DialogConfig<Data = any> extends Required<GlobalDialogConfig> {
  id: string;
  data: Data;
  vcr: ViewContainerRef;
}
