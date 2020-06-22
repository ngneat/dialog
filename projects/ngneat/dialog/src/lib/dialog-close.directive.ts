import { Directive, HostListener, Input, Optional, ElementRef, OnInit } from '@angular/core';

import { DialogRef } from './dialog-ref';
import { DialogService } from './dialog.service';

@Directive({
  selector: '[dialogClose]'
})
export class DialogCloseDirective implements OnInit {
  @Input()
  dialogClose: any;

  constructor(
    @Optional() public ref: DialogRef,
    private host: ElementRef<HTMLElement>,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.ref = this.ref || this.getRefFromParent();
  }

  @HostListener('click')
  onClose() {
    this.ref.close(this.dialogClose);
  }

  private getRefFromParent() {
    let parent = this.host.nativeElement.parentElement;

    while (parent && parent.localName !== 'ngneat-dialog') {
      parent = parent.parentElement;
    }

    return parent ? this.dialogService.dialogs.find(({ id }) => id === parent.id) : null;
  }
}
