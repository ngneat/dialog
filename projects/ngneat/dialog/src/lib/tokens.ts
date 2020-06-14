import { InjectionToken, ViewRef } from '@angular/core';

import { DialogConfig } from './config';

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('Dialog config token', {
  factory: () => undefined
});
export const NODES_TO_INSERT = new InjectionToken<ViewRef>('Nodes inserted into the dialog');
export const DIALOG_DATA = new InjectionToken<any>('Dialog data');
