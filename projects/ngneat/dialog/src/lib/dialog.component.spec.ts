import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let spectator: Spectator<DialogComponent>;
  const createComponent = createComponentFactory(DialogComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
