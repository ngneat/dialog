import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { DialogContentSymbol, DialogContentData } from '../types';
import { DialogRef } from '../dialog-ref';

@Component({
  selector: 'ngneat-dialog-base',
  template: `
    <div class="dialog">
      <div class="dialog-wrapper">
        <div class="dialog-header">
          <span class="dialog-icon">
            <ng-content select=".icon"></ng-content>
          </span>
          <ng-container [ngSwitch]="title?.type">
            <h2 *ngSwitchCase="'string'" [innerHTML]="title.content"></h2>
            <h2 *ngSwitchCase="'template'">
              <ng-container *ngTemplateOutlet="title.content; context: context"></ng-container>
            </h2>
          </ng-container>
        </div>

        <div class="dialog-content" [ngSwitch]="body.type">
          <p *ngSwitchCase="'string'" [class.with-title]="title" [innerHTML]="body.content"></p>
          <p *ngSwitchCase="'template'" [class.with-title]="title">
            <ng-container *ngTemplateOutlet="body.content; context: context"></ng-container>
          </p>
        </div>

        <div class="dialog-footer">
          <ng-content select=".btn"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./base.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseDialogComponent {
  title = this.ref.data[DialogContentSymbol].title;
  body = this.ref.data[DialogContentSymbol].body;
  context = {
    $implicit: this.ref,
    data: this.ref.data
  };

  constructor(public ref: DialogRef<DialogContentData>) {}
}
