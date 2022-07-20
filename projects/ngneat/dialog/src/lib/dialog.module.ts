import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  BaseDialogComponent,
  ConfirmDialogComponent,
  ErrorDialogComponent,
  SuccessDialogComponent
} from './built-in-dialogs';
import { GlobalDialogConfig } from './config';
import { defaultConfig } from './default-config.factory';
import { DialogCloseDirective } from './dialog-close.directive';
import { DialogComponent } from './dialog.component';
import { DialogDraggableDirective } from './draggable.directive';
import { DIALOG_CONFIG, GLOBAL_DIALOG_CONFIG } from './tokens';

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
        },
        {
          provide: DIALOG_CONFIG,
          useFactory: defaultConfig
        }
      ]
    };
  }
}
