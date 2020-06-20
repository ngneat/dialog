import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogComponent } from './dialog.component';
import { GlobalDialogConfig } from './config';
import { GLOBAL_DIALOG_CONFIG } from './tokens';
import { DialogDraggableDirective } from './draggable.directive';
import {
  BaseDialogComponent,
  SuccessDialogComponent,
  ConfirmDialogComponent,
  ErrorDialogComponent
} from './built-in-dialogs';

const BuiltIns = [BaseDialogComponent, SuccessDialogComponent, ConfirmDialogComponent, ErrorDialogComponent];

@NgModule({
  declarations: [DialogComponent, DialogDraggableDirective, BuiltIns],
  imports: [CommonModule],
  exports: [DialogComponent]
})
export class DialogModule {
  static forRoot(config?: GlobalDialogConfig): ModuleWithProviders<DialogModule> {
    return {
      ngModule: DialogModule,
      providers: [
        {
          provide: GLOBAL_DIALOG_CONFIG,
          useValue: config
        }
      ]
    };
  }
}
