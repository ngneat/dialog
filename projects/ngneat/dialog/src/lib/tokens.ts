import { InjectionToken, ViewRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { DialogConfig, GlobalDialogConfig } from './config';
import { SuccessDialogComponent, ConfirmDialogComponent, ErrorDialogComponent } from './built-in-dialogs';

export const GLOBAL_DIALOG_CONFIG = new InjectionToken<Partial<GlobalDialogConfig>>('Global dialog config token');
export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('Dialog config token', {
  providedIn: 'root',
  factory: () => ({
    id: undefined,
    container: inject(DOCUMENT).body,
    backdrop: true,
    enableClose: true,
    draggable: false,
    resizable: false,
    size: 'md',
    windowClass: undefined,
    width: undefined,
    height: undefined,
    data: undefined,
    vcr: undefined,
    sizes: {
      sm: {
        height: '300px',
        width: '300px'
      },
      md: {
        height: '300px',
        width: '300px'
      },
      lg: {
        height: '300px',
        width: '300px'
      },
      fullScreen: {
        height: '100vh',
        width: '100vw'
      }
    },
    success: {
      component: SuccessDialogComponent
    },
    confirm: {
      component: ConfirmDialogComponent
    },
    error: {
      component: ErrorDialogComponent
    }
  })
});
export const NODES_TO_INSERT = new InjectionToken<ViewRef>('Nodes inserted into the dialog');
