import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@ngneat/dialog';

import { AppComponent } from './app.component';
import { TestDialogComponent } from './test-dialog.component';

@NgModule({
  declarations: [AppComponent, TestDialogComponent],
  imports: [BrowserModule, ReactiveFormsModule, DialogModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
