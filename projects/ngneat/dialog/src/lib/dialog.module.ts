import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogComponent, DIALOG_CONFIG } from './dialog.component';
import { DialogConfig } from './config';

@NgModule({
  declarations: [DialogComponent],
  imports: [CommonModule],
  exports: [DialogComponent]
})
export class DialogModule {
  forRoot(config: Partial<DialogConfig>): ModuleWithProviders<DialogModule> {
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
