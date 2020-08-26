import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DialogRef, DialogContentSymbol, DialogContentData, DIALOG_CONFIG, DialogConfig } from '@ngneat/dialog';

interface MyCustomDialogData extends DialogContentData {
  hint: string;
}

@Component({
  template: `
    <!-- This dialog is only for demo purpose  -->
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
      integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z"
      crossorigin="anonymous"
    />

    <div class="modal-content">
      <div class="modal-header">
        <div class="flex-column">
          <ng-container [ngSwitch]="title?.type">
            <h5 *ngSwitchCase="'string'" class="modal-title" [innerHTML]="title.content"></h5>
            <h5 *ngSwitchCase="'template'" class="modal-title">
              <ng-container *ngTemplateOutlet="title.content; context: context"></ng-container>
            </h5>
          </ng-container>
          <small class="text-muted d-block">This dialog is only for demo purpose</small>
        </div>
      </div>
      <div class="modal-body" [ngSwitch]="body.type">
        <small class="text-muted">{{ ref.data.hint }}</small>
        <p *ngSwitchCase="'string'" [class.with-title]="title" [innerHTML]="body.content"></p>
        <p *ngSwitchCase="'template'" [class.with-title]="title">
          <ng-container *ngTemplateOutlet="body.content; context: context"></ng-container>
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" (click)="ref.close(true)">Confirm</button>
        <button
          *ngIf="config.closeButton"
          type="button"
          class="btn btn-secondary"
          data-dismiss="modal"
          (click)="ref.close(false)"
        >
          Close
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalComponent {
  title = this.ref.data[DialogContentSymbol].title;
  body = this.ref.data[DialogContentSymbol].body;
  context = {
    $implicit: this.ref,
    data: this.ref.data
  };

  constructor(public ref: DialogRef<MyCustomDialogData>, @Inject(DIALOG_CONFIG) public config: DialogConfig) {}
}
