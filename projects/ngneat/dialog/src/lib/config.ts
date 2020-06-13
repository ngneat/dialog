import { ViewContainerRef } from '@angular/core';

type Sizes = 'sm' | 'md' | 'lg';

export interface DialogConfig<Data = any> {
  id: string;
  backdrop: boolean;
  container: HTMLElement;
  windowClass: string;
  enableClose: boolean;
  sizes: Record<Sizes, { width: string; height: string }>;
  size: Sizes;
  width: string;
  height: string;
  draggable: boolean;
  fullScreen: boolean;
  data: Data;
  vcr: ViewContainerRef;
}
