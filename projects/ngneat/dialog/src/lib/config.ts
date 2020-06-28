import { ViewContainerRef, ElementRef, Type } from '@angular/core';

type Sizes = 'sm' | 'md' | 'lg' | 'fullScreen';

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
  sizes: Partial<Record<Sizes, { width: string; height: string }>>;
}

export interface DialogConfig<Data = any> extends Required<GlobalDialogConfig> {
  id: string;
  backdrop: boolean;
  container: ElementRef<Element> | Element;
  windowClass: string;
  enableClose: boolean;
  size: Sizes;
  width: string;
  height: string;
  draggable: boolean;
  resizable: boolean;
  data: Data;
  vcr: ViewContainerRef;
}
