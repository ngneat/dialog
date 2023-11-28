import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { DialogConfig, GlobalDialogConfig } from './types';

export const DIALOG_DOCUMENT_REF = new InjectionToken(
  'A reference to the document. Useful for iframes that want appends to parent window',
  {
    providedIn: 'root',
    factory() {
      return inject(DOCUMENT);
    },
  },
);

export function defaultGlobalConfig(): Partial<GlobalDialogConfig & DialogConfig> {
  return {
    id: undefined,
    container: inject(DIALOG_DOCUMENT_REF).body,
    backdrop: true,
    closeButton: true,
    enableClose: {
      backdrop: true,
      escape: true,
    },
    draggable: false,
    dragConstraint: 'none',
    resizable: false,
    size: 'md',
    windowClass: undefined,
    width: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    height: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    data: undefined,
    vcr: undefined,
    sizes: {
      sm: {
        height: 'auto',
        width: '400px',
      },
      md: {
        height: 'auto',
        width: '560px',
      },
      lg: {
        height: 'auto',
        width: '800px',
      },
      fullScreen: {
        height: '100%',
        width: '100%',
      },
    },
    onClose: undefined,
    onOpen: undefined,
  };
}

export const GLOBAL_DIALOG_CONFIG = new InjectionToken<Partial<GlobalDialogConfig>>('Global dialog config token', {
  providedIn: 'root',
  factory() {
    return defaultGlobalConfig();
  },
});

export const NODES_TO_INSERT = new InjectionToken<Element[]>('Nodes inserted into the dialog');

export function provideDialogConfig(config: Partial<GlobalDialogConfig>) {
  return makeEnvironmentProviders([
    {
      provide: GLOBAL_DIALOG_CONFIG,
      useFactory() {
        const defaultConfig = defaultGlobalConfig();
        return {
          ...defaultConfig,
          ...config,
          sizes: {
            ...defaultConfig.sizes,
            ...config.sizes,
          },
        };
      },
    },
  ]);
}

export function provideDialogDocRef(doc: Document) {
  return makeEnvironmentProviders([
    {
      provide: DIALOG_DOCUMENT_REF,
      useValue: doc,
    },
  ]);
}
