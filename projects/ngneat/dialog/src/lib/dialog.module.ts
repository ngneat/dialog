import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { DialogComponent } from './dialog.component';
import { DialogConfig } from './config';
import { DIALOG_CONFIG } from './tokens';

@NgModule({
  declarations: [DialogComponent],
  imports: [CommonModule, DragDropModule],
  exports: [DialogComponent]
})
export class DialogModule {
  static forRoot(config: Partial<DialogConfig>): ModuleWithProviders<DialogModule> {
    return {
      ngModule: DialogModule,
      providers: [
        {
          provide: DIALOG_CONFIG,
          useValue: config
        }
      ]
    };
  }
}
