import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseDialogComponent } from './base.component';

@Component({
  selector: 'ngneat-dialog-success',
  template: `
    <ngneat-dialog-base>
      <svg class="icon icon-success" x="0px" y="0px" viewBox="0 0 496 496">
        <g>
          <path
            d="M248,0C111.033,0,0,111.033,0,248s111.033,248,248,248s248-111.033,248-248C495.841,111.099,384.901,0.159,248,0z      M248,480C119.87,480,16,376.13,16,248S119.87,16,248,16s232,103.87,232,232C479.859,376.072,376.072,479.859,248,480z"
          />
          <path
            d="M370.344,158.344L208,320.688l-82.344-82.344c-3.178-3.07-8.242-2.982-11.312,0.196c-2.994,3.1-2.994,8.015,0,11.116     l88,88c3.124,3.123,8.188,3.123,11.312,0l168-168c3.07-3.178,2.982-8.242-0.196-11.312     C378.359,155.35,373.444,155.35,370.344,158.344z"
          />
        </g>
      </svg>

      <button class="btn btn-success" (click)="ref.close()">OK</button>
    </ngneat-dialog-base>
  `,
  styleUrls: ['./host.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessDialogComponent extends BaseDialogComponent {}
