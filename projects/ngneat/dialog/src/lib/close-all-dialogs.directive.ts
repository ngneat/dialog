import { Directive, HostListener, inject } from '@angular/core';

import { DialogService } from './dialog.service';

@Directive({
  selector: '[closeAllDialogs]',
  standalone: true,
})
export class CloseAllDialogsDirective {
  private dialogService = inject(DialogService);

  @HostListener('click')
  onClose() {
    this.dialogService.closeAll();
  }
}
