import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken, ViewRef } from '@angular/core';

import { DialogConfig, GlobalDialogConfig } from './config';

export const DIALOG_DOCUMENT_REF = new InjectionToken(
  'A reference to the document. Useful for iframes that want appends to parent window',
  {
    providedIn: 'root',
    factory() {
      return inject(DOCUMENT);
    }
  }
);

export const GLOBAL_DIALOG_CONFIG = new InjectionToken<Partial<GlobalDialogConfig>>('Global dialog config token');

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('Dialog config token');
export const NODES_TO_INSERT = new InjectionToken<ViewRef>('Nodes inserted into the dialog');
