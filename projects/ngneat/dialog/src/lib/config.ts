import { ViewContainerRef, ElementRef, Type } from '@angular/core';

type Sizes = 'sm' | 'md' | 'lg';

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
  sizes: Record<Sizes, { width: string; height: string }>;
}

export interface DialogConfig<Data = any> extends GlobalDialogConfig {
  id: string;
  backdrop: boolean;
  container: ElementRef<Element> | Element;
  windowClass: string;
  enableClose: boolean;
  size: Sizes;
  width: string;
  height: string;
  draggable: boolean;
  fullScreen: boolean;
  resizable: boolean;
  data: Data;
  vcr: ViewContainerRef;
}
