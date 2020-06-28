import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { interval } from 'rxjs';

import { DialogRef } from '@ngneat/dialog';
import { FormControl } from '@angular/forms';

interface DialogData {
  title: string;
  withResult: boolean;
}

@Component({
  selector: 'app-test-dialog',
  template: `
    <h2>{{ ref.data?.title || 'Test dialog using a component' }}</h2>

    <div class="content">
      <p>This is a test dialog with a timer: {{ timer$ | async }}</p>

      <div *ngIf="ref.data?.withResult; else dontWantReturnAnything">
        <label style="display: block">What is the message you want to return on close?</label>
        <input style="display: block; width: 100%;" [formControl]="message" />
      </div>

      <ng-template #dontWantReturnAnything>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet placerat erat, ac suscipit nisl.
          Phasellus euismod massa id leo facilisis eleifend. Sed bibendum pharetra molestie. Cras a odio lorem. Donec
          tellus ipsum, consectetur vel tempor at, gravida at ligula. Nullam cursus tempor nisl, nec interdum velit
          tempus eu. In semper venenatis augue, at porttitor tortor dictum ut. Praesent ut risus non lacus cursus
          consequat id sed ligula.
        </p>
      </ng-template>

      <div class="buttons">
        <button (click)="ref.close(message.value)">{{ ref.data?.withResult ? 'Send your message' : 'Close' }}</button>
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
export class TestDialogComponent {
  timer$ = interval(1000);

  message = new FormControl('This dialog looks pretty cool 😎');

  constructor(public ref: DialogRef<DialogData>) {}
}
