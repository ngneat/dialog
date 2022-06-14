import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@ngneat/dialog';

import { AppComponent } from './app.component';
import { TestDialogComponent } from './test-dialog.component';
import { ConfirmationModalComponent } from './custom-confirm-dialog.component';
import { ResetLocationDialogComponent } from './reset-location-dialog.component';

@NgModule({
  declarations: [AppComponent, TestDialogComponent, ResetLocationDialogComponent, ConfirmationModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    DialogModule.forRoot({
      onOpen() {
        console.log('open');
      },
      onClose() {
        console.log('close');
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
