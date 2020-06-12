import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let spectator: SpectatorService<DialogService>;
  const createService = createServiceFactory(DialogService);

  beforeEach(() => (spectator = createService()));

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
