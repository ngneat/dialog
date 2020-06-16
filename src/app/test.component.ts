import { Component, ChangeDetectionStrategy, OnInit, Optional, Inject } from '@angular/core';
import { interval } from 'rxjs';

import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'app-test',
  template: `
    <h1>{{ ref.data.title }}</h1>

    <div class="content">
      <p>Test component with a timer: {{ timer$ | async }}</p>
      <p *ngIf="valueFromVCRParentInjector">
        Injected from View Container Ref injector: {{ valueFromVCRParentInjector }}
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet placerat erat, ac suscipit nisl.
        Phasellus euismod massa id leo facilisis eleifend. Sed bibendum pharetra molestie. Cras a odio lorem. Donec
        tellus ipsum, consectetur vel tempor at, gravida at ligula. Nullam cursus tempor nisl, nec interdum velit tempus
        eu. In semper venenatis augue, at porttitor tortor dictum ut. Praesent ut risus non lacus cursus consequat id
        sed ligula. Curabitur eu dapibus velit, sit amet dapibus odio. Morbi vitae luctus felis. Proin sed nulla a
        tortor lobortis sollicitudin ac vel urna. Etiam quam nibh, dapibus nec purus et, rhoncus euismod arcu. Vivamus
        dignissim sapien ex. Nunc varius congue lacinia. In hac habitasse platea dictumst. Donec metus justo, bibendum
        quis fermentum sed, fermentum in lacus. Nulla lorem lorem, ultricies hendrerit orci vel, finibus fringilla
        lorem. Fusce nec ex imperdiet, scelerisque velit et, elementum lectus. Maecenas vel arcu quis felis maximus
        tempus.
      </p>

      <div class="buttons">
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

      h1 {
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
export class TestComponent implements OnInit {
  title = 'dialog';

  timer$ = interval(1000);

  constructor(public ref: DialogRef, @Optional() @Inject('VCRProvider') public valueFromVCRParentInjector: string) {}

  ngOnInit() {
    console.log(`Dialog with ID ${this.ref.id} opened`);
  }
}
