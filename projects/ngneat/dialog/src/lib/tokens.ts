import { InjectionToken, ViewRef } from '@angular/core';

import { DialogConfig } from './config';

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('Dialog config token', {
  factory: () => undefined
});
export const VIEW_TO_INSERT = new InjectionToken<ViewRef>('View inserted into dialog');
export const DIALOG_DATA = new InjectionToken<any>('Dialog data');
