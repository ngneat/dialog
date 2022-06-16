import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { interval } from 'rxjs';

import { DialogRef } from '@ngneat/dialog';
import { FormControl } from '@angular/forms';

interface DialogData {
  title: string;
  withResult: boolean;
}

@Component({
  selector: 'app-reset-location-dialog',
  template: `
    <h2>You can reset locations</h2>

    <div class="content">
      <div>
        <label>Offset-x</label>
        <input type="number" [formControl]="offsetX" />
      </div>
      <div>
        <label>Offset-y</label>
        <input type="number" [formControl]="offsetY" />
      </div>

      <div class="buttons">
        <button (click)="resetDrag()">Reset location</button>
        <button (click)="ref.close()">Close</button>
      </div>
    </div>
  `,
  styles: [
    `
      .content {
        padding: 18px;
        padding-top: 0;
      }

      h2 {
        border-bottom: 1px solid black;
        padding: 18px;
      }

      .buttons {
        text-align: right;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetLocationDialogComponent {
  offsetX = new FormControl(0);
  offsetY = new FormControl(0);

  constructor(public ref: DialogRef<DialogData>) {}

  resetDrag(): void {
    this.ref.resetDrag({ x: this.offsetX.value, y: this.offsetY.value });
  }
}
