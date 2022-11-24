import { NO_ERRORS_SCHEMA } from '@angular/core';
import { createDirectiveFactory } from '@ngneat/spectator';

import { DialogCloseDirective } from '../dialog-close.directive';
import { DialogService } from '../dialog.service';
import { DialogRef } from '../dialog-ref';

describe('DialogClose', () => {
  const createDirective = createDirectiveFactory({
    directive: DialogCloseDirective,
    schemas: [NO_ERRORS_SCHEMA],
  });

  it('should get dialog-ref getting id from parent a searching in dialog-service', () => {
    const dialogRefFromParent = { id: 'from-parent' };

    const spectator = createDirective(
      '<ngneat-dialog id="from-parent"> <button dialogClose></button> </ngneat-dialog>',
      {
        providers: [
          {
            provide: DialogService,
            useValue: {
              dialogs: [dialogRefFromParent],
            },
          },
        ],
      }
    );

    expect(spectator.directive.ref).toBe(dialogRefFromParent as any);
  });

  it('should get dialog-ref from injector', () => {
    const dialogRefFromParent = { id: 'from-parent' };
    const dialogRefFromInjector = { id: 'from-injector' };

    const spectator = createDirective('<ngneat-dialog id="test"> <button dialogClose></button> </ngneat-dialog>', {
      providers: [
        {
          provide: DialogRef,
          useValue: dialogRefFromInjector,
        },
        {
          provide: DialogService,
          useValue: {
            dialogs: [dialogRefFromParent],
          },
        },
      ],
    });

    expect(spectator.directive.ref).toBe(dialogRefFromInjector as any);
  });

  it('on close should call dialog-ref close method, passing result', () => {
    const dialogRefFromInjector: Partial<DialogRef> = {
      id: 'from-injector',
      close: jasmine.createSpy(),
    };

    const spectator = createDirective(`<button [dialogClose]="'something'"></button>`, {
      providers: [
        {
          provide: DialogRef,
          useValue: dialogRefFromInjector,
        },
        {
          provide: DialogService,
          useValue: {
            dialogs: [],
          },
        },
      ],
    });

    spectator.click(spectator.query('button'));

    spectator.detectChanges();

    expect(dialogRefFromInjector.close).toHaveBeenCalledWith('something');
  });
});
