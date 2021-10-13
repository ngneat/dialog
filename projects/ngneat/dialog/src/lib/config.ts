import { ViewContainerRef, ElementRef, Type } from '@angular/core';

type Sizes = 'sm' | 'md' | 'lg' | 'fullScreen' | string;
export type DragConstraint = 'none' | 'bounce' | 'constrain';

export interface GlobalDialogConfig {
  success: {
    component: Type<any>;
  };
  confirm: {
    component: Type<any>;
  };
  error: {
    component: Type<any>;
  };
  sizes: Partial<
    Record<
      Sizes,
      { width?: string | number; height?: string | number; minHeight?: string | number; maxHeight?: string | number }
    >
  >;
  container: ElementRef<Element> | Element;
  windowClass: string;
  onOpen: () => void | undefined;
  onClose: () => void | undefined;
}

export interface DialogConfig<Data = any> extends Required<GlobalDialogConfig> {
  id: string;
  backdrop: boolean;
  closeButton: boolean;
  container: ElementRef<Element> | Element;
  windowClass: string;
  enableClose: boolean;
  size: Sizes;
  width: string | number;
  height: string | number;
  minHeight: string | number;
  maxHeight: string | number;
  draggable: boolean;
  dragConstraint: DragConstraint;
  resizable: boolean;
  data: Data;
  vcr: ViewContainerRef;
}
