import { ComponentRef, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

type DisposeFN = () => void;
type PreventFN = () => void;
type RefType = ComponentRef<any> | TemplateRef<any>;

export class DialogRef<Data = any, Ref extends RefType = RefType> {
  public ref: Ref;
  public id: string;
  public data: Data;
  public dispose: DisposeFN;
  public backdropClick$: Observable<MouseEvent>;

  public afterClosed$: Observable<void>;
  public beforeClose$: Observable<PreventFN>;
}
