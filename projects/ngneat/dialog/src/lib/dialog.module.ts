import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogComponent } from './dialog.component';
import { DialogCloseDirective } from './dialog-close.directive';
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
  declarations: [DialogComponent, DialogCloseDirective, DialogDraggableDirective, BuiltIns],
  imports: [CommonModule],
  entryComponents: [DialogComponent],
  exports: [DialogComponent, DialogCloseDirective]
})
export class DialogModule {
  static forRoot(config: Partial<GlobalDialogConfig> = {}): ModuleWithProviders<DialogModule> {
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
