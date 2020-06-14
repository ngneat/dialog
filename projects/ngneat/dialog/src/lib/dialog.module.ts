import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogComponent } from './dialog.component';
import { DialogConfig } from './config';
import { DIALOG_CONFIG } from './tokens';
import { DialogDraggableDirective } from './draggable.directive';

@NgModule({
  declarations: [DialogComponent, DialogDraggableDirective],
  imports: [CommonModule],
  exports: [DialogComponent]
})
export class DialogModule {
  static forRoot(sizes?: DialogConfig['sizes']): ModuleWithProviders<DialogModule> {
    return {
      ngModule: DialogModule,
      providers: [
        {
          provide: DIALOG_CONFIG,
          useValue: sizes
        }
      ]
    };
  }
}
