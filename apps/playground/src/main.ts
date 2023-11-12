import { bootstrapApplication } from '@angular/platform-browser';

import { provideDialogConfig } from '@ngneat/dialog';

import { AppComponent } from './app/app.component';

let zIndex = 100;

bootstrapApplication(AppComponent, {
  providers: [
    provideDialogConfig({
      zIndexGetter() {
        return zIndex++;
      },
      onOpen() {
        console.log('open');
      },
      onClose() {
        console.log('close');
      },
    }),
  ],
});
