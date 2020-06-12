import { ComponentRef, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

type DisposeFN = () => void;
type RefType = ComponentRef<any> | TemplateRef<any>;

export class DialogRef<Ref extends RefType = RefType> {
  public ref: Ref;
  public id: string;
  public dispose: DisposeFN;
  public backdropClick$: Observable<MouseEvent>;
}
