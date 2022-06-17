<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>
<br />

> A simple to use, highly customizable, and powerful modal for Angular Applications

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
[![ngneat](https://img.shields.io/badge/@-ngneat-383636?style=flat-square&labelColor=8f68d4)](https://github.com/ngneat/)
[![spectator](https://img.shields.io/badge/tested%20with-spectator-2196F3.svg?style=flat-square)]()

## Features

✅ &nbsp;TemplateRef/Component Support  
✅ &nbsp;Dialog Guards Support  
✅ &nbsp;Resizable  
✅ &nbsp;Draggable  
✅ &nbsp;Multiple Dialogs Support  
✅ &nbsp;Built-in Confirm/Success/Error Dialogs  
✅ &nbsp;Customizable

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using a Component](#using-a-component)
  - [DialogRef API](#DialogRef-API)
  - [Using a TemplateRef](#using-a-TemplateRef)
  - [Passing Data to Modal](#Passing-Data-to-Modal)
- [Modal Options](#dialog-options)
  - [Global Options](#global-options)
  - [Instance Options](#instance-options)
- [Built-in Confirm/Success/Error Modals](#Built-in-modals)
- [Custom Sizes](#Custom-Sizes)
- [Styling](#styling)

## Installation

From your project folder, run:

`ng add @ngneat/dialog`

This command will import the `DialogModule.forRoot()` in your `AppModule`:

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

First, create the component to be displayed in the modal:

```ts
import { DialogService, DialogRef } from '@ngneat/dialog';

interface Data {
 title: string
}

@Component({
  template: `
    <h1>{{title}}</h1>
    <button (click)="ref.close(true)">Close</button>
  `
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWorldComponent {
  get title() {
    if (!this.ref.data) return 'Hello world';
    return this.ref.data.title;
  }

  constructor(public ref: DialogRef<Data, boolean>) {}
}
```

Inside the component, you'll have access to a `DialogRef` provider. You can call its `close()` method to close the current modal. You can also pass `data` that'll be available for any subscribers to `afterClosed$`.

> 💡 Tip
> 
> If you define the types for your DialogRef provider, the `afterClosed$` and `close(params)` will be typed automatically.

Now we can use the `DialogService` to open open the modal and display the component:

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

- `afterClosed$` - An observable that emits after the modal closes:

```ts
const dialogRef = this.dialog.open(HelloWorldComponent);
dialogRef.afterClosed$.subscribe(result => {
  console.log(`After dialog has been closed ${result}`);
});
```

- `backdropClick$` - An observable that emits when the user clicks on the modal backdrop:

```ts
const dialogRef = this.dialog.open(HelloWorldComponent);
dialogRef.backdropClick$.subscribe(() => {
  console.log('Backdrop has been clicked');
});
```

- `resetDrag` - A method that can be called to reset the dragged modal to the middle of the screen. An offset can be given as the first parameter to position it different from the center:

```ts
dialogRef.resetDrag();
dialogRef.resetDrag({ x: 100, y: 0 });
```

- `beforeClose` - A guard that should return a `boolean`, an `observable`, or a `promise` indicating whether the modal can be closed:

```ts
dialogRef.beforeClose(result => dialogCanBeClosed);
dialogRef.beforeClose(result => this.service.someMethod(result));
```

- `ref.data` - A reference to the `data` that is passed by the component opened in the modal:

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

The library also provides the `dialogClose` directive helper, that you can use to close the modal:

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

Sometimes it can be overkill to create a whole component. In these cases, you can pass a reference to an `<ng-template>`:

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

Note that in this case, you can access the `ref` object by using the `$implicit` context property.

### Passing Data to the Modal Component

Sometimes we need to pass data from the opening component to our modal component. In these cases, we can use the `data` property, and use it to pass any data we need:

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

Now we can access it inside our modal component or template, by using the `ref.data` property.

## Dialog Options

### Global Options

In the `forRoot` method when importing the dialog module in the app module you can specify the following options that will be globally applied to all dialog instances.

- `closeButton` - Whether to display an 'X' for closing the modal (default is true).
- `enableClose` - Whether a click on the backdrop should close the modal (default is true).
- `backdrop` - Whether to show the backdrop element (default is true).
- `resizable` - Whether the modal show be resizeable (default is false).
- `draggable` - Whether the modal show be draggable (default is false).
- `draggableConstraint` - When draggable true, whether the modal should be constraint to the window. Use `none` for no constraint, `bounce` to have the modal bounce after it is released and `constrain` to constrain while dragging (default is `none`).
- `size` - Set the modal size according to your global [custom sizes](#custom-sizes) (default is `md`).
- `windowClass` - Add a custom class to the modal container.
- `width` - Set a custom width (default unit is `px`).
- `height` - Set a custom height (default unit is `px`).
- `minHeight` - Set a custom min-height (default unit is `px`).
- `maxHeight` - Set a custom max-height (default unit is `px`).
- `container` - A custom element to which we append the modal (default is `body`).

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [DialogModule.forRoot({
    closeButton: boolean,
    enableClose: boolean,
    backdrop: boolean,
    resizable: boolean,
    draggable: boolean,
    draggableConstraint: none | bounce | constrain,
    size: sm | md | lg | fullScreen | string,
    windowClass: string,
    width: string | number,
    height: string | number,
    minHeight: string | number,
    maxHeight: string | number
  })],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Instance Options
For each dialog instance you open you can specify all the global options and also the following 3 options.

- `id` - The modal unique id (defaults to random id).
- `vcr` - A custom `ViewContainerRef` to use.
- `data` - A `data` object that will be passed to the modal template or component.

```ts
this.dialog.open(compOrTemplate, {
  //...
  // all global options
  //...
  id: string,
  vcr: ViewContainerRef,
  data: {}
});
```

## Built-in Modals

The library provides built-in modals for common cases where we need to show a confirmation message, a success message, or an error message:

```ts
this.dialog
  .confirm({
    title: 'Are you sure?',
    body: 'This action cannot be undone.'
  })
  .afterClosed$.subscribe(confirmed => console.log(confirmed));

this.dialog.success({
  title: 'Hurray!',
  body: '<h1>You Made It!!!</h1>'
});

this.dialog.error({
  title: 'Oh no',
  body: tpl
});
```

The `body` type can be a `string`, `HTML string`, or a `<ng-template>`.

### Customization
You can customize the built-in dialogs in two ways. You can specify your own component and you can customize the text of the buttons in the default dialogs.

The confirm and cancel texts can either be of type `string` or `Observable<string>`. The last is useful in case you want a string that changes based on your language with something like [Transloco](https://ngneat.github.io/transloco/).
```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DialogModule.forRoot({
      success: {
        component: AppSuccessDialog,
        confirmText: 'OK'
      },
      confirm: {
        component: AppConfirmDialog,
        confirmText: 'OK',
        cancelText: 'Cancel'
      },
      error: {
        component: AppErrorDialog,
        confirmText: 'OK'
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Custom Sizes

You can define the modal sizes globally by using the `sizes` option:

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DialogModule.forRoot({
      sizes: {
        sm: {
          width: 300, // 300px
          minHeight: 250 // 250px
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
        },
        stretch: {
          minHeight: 500,
          maxHeight: '85%'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Styling

You can customize the styles with these classes:

```scss
ngneat-dialog {
  .ngneat-dialog-backdrop {
    // backdrop styles
    .ngneat-dialog-content {
      // dialog content, where your component/template is placed
      .ngneat-drag-marker {
        // draggable marker
      }
      .ngneat-close-dialog {
        // 'X' icon for closing the dialog
      }
      .ngneat-dialog-primary-btn,
      .ngneat-dialog-secondary-btn {
        // the default dialogs action buttons
      }
    }
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
    <td align="center"><a href="https://github.com/tonivj5"><img src="https://avatars2.githubusercontent.com/u/7110786?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Toni Villena</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=tonivj5" title="Code">💻</a> <a href="#infra-tonivj5" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/@ngneat/dialog/commits?author=tonivj5" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.netbasal.com/"><img src="https://avatars1.githubusercontent.com/u/6745730?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Netanel Basal</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=NetanelBasal" title="Documentation">📖</a> <a href="#ideas-NetanelBasal" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/@ngneat/dialog/commits?author=NetanelBasal" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/theblushingcrow"><img src="https://avatars3.githubusercontent.com/u/638818?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Inbal Sinai</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=theblushingcrow" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/shaharkazaz"><img src="https://avatars2.githubusercontent.com/u/17194830?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shahar Kazaz</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=shaharkazaz" title="Code">💻</a> <a href="https://github.com/@ngneat/dialog/commits?author=shaharkazaz" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/beeman"><img src="https://avatars3.githubusercontent.com/u/36491?v=4?s=100" width="100px;" alt=""/><br /><sub><b>beeman</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=beeman" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rhutchison"><img src="https://avatars.githubusercontent.com/u/1460261?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Hutchison</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=rhutchison" title="Code">💻</a> <a href="#ideas-rhutchison" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://riskchallenger.nl/"><img src="https://avatars.githubusercontent.com/u/1962982?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Wybren Kortstra</b></sub></a><br /><a href="https://github.com/@ngneat/dialog/commits?author=Langstra" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
<br/>
Logo made by <a href="https://www.flaticon.com/free-icon/business_1572571?term=dialog&page=2&position=44" title="itim2101">itim2101</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
