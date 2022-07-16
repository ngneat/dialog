import { inject } from '@angular/core';
import { ConfirmDialogComponent, ErrorDialogComponent, SuccessDialogComponent } from './built-in-dialogs';
import { DialogConfig } from './config';
import { DIALOG_DOCUMENT_REF } from './tokens';

export const defaultConfig = (): DialogConfig => {
  return {
    id: undefined,
    container: inject(DIALOG_DOCUMENT_REF).body,
    backdrop: true,
    closeButton: true,
    enableClose: true,
    draggable: false,
    dragConstraint: 'none',
    resizable: false,
    size: 'md',
    windowClass: undefined,
    width: undefined,
    height: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    data: undefined,
    vcr: undefined,
    sizes: {
      sm: {
        minHeight: '200px',
        width: '400px'
      },
      md: {
        minHeight: '280px',
        width: '560px'
      },
      lg: {
        minHeight: '350px',
        width: '800px'
      },
      fullScreen: {
        height: '100%',
        width: '100%'
      }
    },
    success: {
      component: SuccessDialogComponent,
      confirmText: 'OK'
    },
    confirm: {
      component: ConfirmDialogComponent,
      confirmText: 'OK',
      cancelText: 'Cancel'
    },
    error: {
      component: ErrorDialogComponent,
      confirmText: 'OK'
    },
    onClose: undefined,
    onOpen: undefined
  };
};
