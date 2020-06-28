<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>

<br />

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
[![ngneat](https://img.shields.io/badge/@-ngneat-383636?style=flat-square&labelColor=8f68d4)](https://github.com/ngneat/)
[![spectator](https://img.shields.io/badge/tested%20with-spectator-2196F3.svg?style=flat-square)]()

> Simple to use, highly customizable, and powerful modal for Angular Applications

## Features

✅ TemplateRef/Component Support <br>
✅ Dialog Guards Support <br>
✅ Resizable <br>
✅ Draggable <br>
✅ Multiple Dialogs Support <br>
✅ Built-in Confirm/Success/Error Dialogs <br>
✅ Customizable

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using a Component](#using-a-component)
  - [DialogRef API](#DialogRef-API)
  - [Using a TemplateRef](#using-a-TemplateRef)
  - [Passing Data to Modal](#Passing-Data-to-Modal)
- [Modal Options](#modal-options)
- [Built-in Confirm/Success/Error Modals](#Built-in-modals)
- [Custom Sizes](#Custom-Sizes)
- [Styling](#styling)

## Installation

`ng add @ngneat/dialog`

The command will import the `DialogModule.forRoot()` in your `AppModule`:

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [DialogModule.forRoot()],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Usage

### Using a Component

First, we need to create the modal component:

```ts
import { DialogService, DialogRef } from '@ngneat/dialog';

@Component({
  template: `
    <h1>Hello World</h1>
    <button (click)="ref.close()">Close</button>
  `
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWorldComponent {
  constructor(public ref: DialogRef) {}
}
```

Inside the component, you'll have access to a `DialogRef` provider. You can call its `close()` method to close the current modal. You can also pass `data` that'll be available for any `afterClosed$` subscribers.

Now we can use the `DialogService` to open it:

```ts
import { DialogService } from '@ngneat/dialog';

@Component({
  template: `
    <button (click)="open()">Open</button>
  `
})
export class AppComponent implements OnInit {
  constructor(private dialog: DialogService) {}

  ngOnInit() {
    const dialogRef = this.dialog.open(HelloWorldComponent);
  }
}
```

### DialogRef API

The `DialogRef` instance exposes the following API:

- `afterClosed$` - An observable that emits after the dialog closes:

```ts
const dialogRef = this.dialog.open(HelloWorldComponent);
dialogRef.afterClosed$.subscribe(result => {
  console.log(`After dialog has been closed ${result}`);
});
```

- `backdropClick$` - An observable that emits when the user clicks on the backdrop:

```ts
const dialogRef = this.dialog.open(HelloWorldComponent);
dialogRef.backdropClick$.subscribe(() => {
  console.log('Backdrop has been clicked');
});
```

- `beforeClose` - A guard that should returns a `boolean`, an `observable`, or a `promise` indicates wheter the modal can be closed:

```ts
dialogRef.beforeClose(result => dialogCanBeClosed);
dialogRef.beforeClose(result => this.service.someMethod(result));
```

- `ref.data` - A reference to the `data` that is passed by the opening component:

```ts
import { DialogService, DialogRef } from '@ngneat/dialog';

@Component({
  template: `
    <h1>{{ ref.data.title }}</h1>
    <button (click)="ref.close()">Close</button>
  `
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWorldComponent {
  constructor(public ref: DialogRef) {}
}
```

The library also provides the `dialogClose` directive helper that you can use to close the modal:

```ts
import { DialogService, DialogRef } from '@ngneat/dialog';

@Component({
  template: `
    <h1>Hello World</h1>
    <button dialogClose>Close</button>
    <button [dialogClose]="result">Close with result</button>
  `
})
export class HelloWorldComponent {}
```

### Using a TemplateRef

Sometimes it can be overkill to create a component. In these cases, you can pass a reference to a `<ng-template>`:

```ts
import { DialogService } from '@ngneat/dialog';

@Component({
  selector: 'app-root',
  template: `
    <ng-template #modalTpl let-ref>
      <h1>Hello World</h1>

      <button (click)="ref.close()">Close</button>
    </ng-template>

    <button (click)="open(modalTpl)">Open</button>
  `
})
export class AppComponent {
  constructor(private dialog: DialogService) {}

  open(tpl: TemplateRef<any>) {
    this.dialog.open(tpl);
  }
}
```

Note that in this case, you can access the `ref` object by using the context property `$implicit`.

### Passing Data to Modal

Sometimes we need to pass data from the opening component to our modal component. In this cases, we can use the `data` property, and pass any data we need:

```ts
import { DialogService } from '@ngneat/dialog';

@Component({
  template: `
    <button (click)="open()">Open</button>
  `
})
export class AppComponent implements OnInit {
  private id = '...';

  constructor(private dialog: DialogService) {}

  ngOnInit() {
    const dialogRef = this.dialog.open(HelloWorldComponent, {
      data: {
        id: this.id
      }
    });
  }
}
```

Now we can access it inside our modal component or template, by using `ref.data` property.

### Modal Options

- `id` - The modal unique id. (defaults to random id)
- `enableClose` - Whether a click on the backdrop should close the modal
- `backdrop` - Wheteher to show the backdrop element
- `resizable` - Whether the modal show be resizeable
- `draggable` - Whether the modal show be draggable
- `size` - Set the modal size. The available options are `sm`, `md`, `lg` and `fullScreen`
- `windowClass` - Add a custom class to the modal container
- `width` - Set custom width
- `height` - Set custom height
- `container` - A custom element to which we append the modal
- `vcr` - A custom `ViewContainerRef` to use
- `data` - A `data` that will be passed to the modal template or component

```ts
this.dialog.open(compOrTemplate, {
  id: string,
  enableClose: boolean,
  backdrop: boolean,
  resizable: boolean,
  draggable: boolean,
  size: sm | md | lg | fullScreen,
  windowClass: string,
  width: string,
  height: string
});
```

## Built-in Modals

The library provides a built-in dialogs for common cases where we need to show a confirmation, a success, or an error dialog:

```ts
this.dialog
  .confirm({
    title: 'Are you sure?',
    body: 'The dialog body'
  })
  .afterClosed$.subscribe(confirmed => console.log(confirmed));

this.dialog.success({
  title: 'Hurray!',
  body: 'The dialog body'
});

this.dialog.error({
  title: 'Oh no',
  body: 'The dialog body'
});
```

The `content` type can be a `string`, `HTML`, or a `<ng-template>`.

You can also change the default dialogs and use your own:

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DialogModule.forRoot({
      success: {
        component: AppSuccessDialog
      },
      confirm: {
        component: AppConfirmDialog
      },
      error: {
        component: AppErrorDialog
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Custom Sizes

You can define the modal sizes globally by using the `sizes` options:

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DialogModule.forRoot({
      sizes: {
        sm: {
          width: '300px',
          height: '250px'
        },
        md: {
          width: '60vw',
          height: '60vh'
        },
        lg: {
          width: '90vw',
          height: '90vh'
        },
        fullScreen: {
          width: '100vw',
          height: '100vh'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

The default size is `md`.

## Styling

You can customize the styles with this classes:

```scss
ngneat-dialog {
  .ngneat-dialog-container {
    // dialog container
    .ngneat-dialog-content {
      // dialgo content, where your component/template is placed
    }
  }

  .ngneat-dialog-backdrop {
    // backdrop styles
  }

  .ngneat-drag-marker {
    // draggable marker
  }
}
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/tonivj5"><img src="https://avatars2.githubusercontent.com/u/7110786?v=4" width="100px;" alt=""/><br /><sub><b>Toni Villena</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=tonivj5" title="Code">💻</a> <a href="#infra-tonivj5" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/@ngneat/dialog/commits?author=tonivj5" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.netbasal.com/"><img src="https://avatars1.githubusercontent.com/u/6745730?v=4" width="100px;" alt=""/><br /><sub><b>Netanel Basal</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=NetanelBasal" title="Documentation">📖</a> <a href="#ideas-NetanelBasal" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/@ngneat/dialog/commits?author=NetanelBasal" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
