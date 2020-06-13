export interface DialogConfig<Data = any> {
  id: string;
  backdrop: boolean;
  container: HTMLElement;
  windowClass: string;
  enableClose: boolean;
  size: string;
  width: string;
  height: string;
  draggable: boolean;
  fullScreen: boolean;
  data: Data;
}
