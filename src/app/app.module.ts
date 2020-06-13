import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TestComponent } from './test.component';
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent, TestComponent],
  imports: [BrowserModule, DialogModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
