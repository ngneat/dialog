import { bootstrapApplication } from '@angular/platform-browser';
import { provideDialogConfig } from '@ngneat/dialog';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideDialogConfig({
      onOpen() {
        console.log('open');
      },
      onClose() {
        console.log('close');
      },
    }),
  ],
});
