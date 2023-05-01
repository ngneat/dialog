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
✅ &nbsp;Customizable

## Installation

`npm i @ngneat/dialog`

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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWorldComponent {
  ref: DialogRef<Data> = inject(DialogRef);

  get title() {
    if (!this.ref.data) return 'Hello world';
    return this.ref.data.title;
  }
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
  standalone: true,
  template: ` <button (click)="open()">Open</button> `,
})
export class AppComponent implements OnInit {
  private dialog = inject(DialogService);

  ngOnInit() {
    const dialogRef = this.dialog.open(HelloWorldComponent, {
      // data is typed based on the passed generic
      data: {
        title: '',
      },
    });
  }
}
```

### DialogRef API

The `DialogRef` instance exposes the following API:

- `afterClosed$` - An observable that emits after the modal closes:

```ts
const dialogRef = this.dialog.open(HelloWorldComponent);
dialogRef.afterClosed$.subscribe((result) => {
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
dialogRef.beforeClose((result) => dialogCanBeClosed);
dialogRef.beforeClose((result) => this.service.someMethod(result));
```

- `ref.data` - A reference to the `data` that is passed by the component opened in the modal:

```ts
import { DialogService, DialogRef } from '@ngneat/dialog';

@Component({
  template: `
    <h1>{{ ref.data.title }}</h1>
    <button (click)="ref.close()">Close</button>
  `
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWorldComponent {
  ref: DialogRef<Data> = inject(DialogRef);
}
```

The library also provides the `dialogClose` directive helper, that you can use to close the modal:

```ts
import { DialogService, DialogCloseDirective } from '@ngneat/dialog';

@Component({
  standalone: true,
  imports: [DialogCloseDirective],
  template: `
    <h1>Hello World</h1>
    <button dialogClose>Close</button>
    <button [dialogClose]="result">Close with result</button>
  `,
})
export class HelloWorldComponent {}
```

### Using a TemplateRef

Sometimes it can be overkill to create a whole component. In these cases, you can pass a reference to an `<ng-template>`:

```ts
import { DialogService } from '@ngneat/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <ng-template #modalTpl let-ref>
      <h1>Hello World</h1>

      <button (click)="ref.close()">Close</button>
    </ng-template>

    <button (click)="open(modalTpl)">Open</button>
  `,
})
export class AppComponent {
  private dialog = inject(DialogService);

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
  standalone: true,
  template: ` <button (click)="open()">Open</button> `,
})
export class AppComponent implements OnInit {
  private dialog = inject(DialogService);
  private id = '...';

  ngOnInit() {
    const dialogRef = this.dialog.open(HelloWorldComponent, {
      data: {
        id: this.id,
      },
    });
  }
}
```

Now we can access it inside our modal component or template, by using the `ref.data` property.

## Dialog Options

### Global Options

In the `forRoot` method when importing the dialog module in the app module you can specify the following options that will be globally applied to all dialog instances.

- `closeButton` - Whether to display an 'X' for closing the modal (default is true).
- `enableClose` - Whether a click on the backdrop, or press of the escape button, should close the modal (default is true), see [enable close](#enable-close).
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
import { provideDialogConfig } from '@ngneat/dialog';

bootstrapApplication(AppComponent, {
  providers: [
    provideDialogConfig({
      closeButton: boolean,
      enableClose: boolean | 'onlyLastStrategy',
      backdrop: boolean,
      resizable: boolean,
      draggable: boolean,
      draggableConstraint: none | bounce | constrain,
      sizes,
      size: sm | md | lg | fullScreen | string,
      windowClass: string,
      width: string | number,
      height: string | number,
      minHeight: string | number,
      maxHeight: string | number,
    }),
  ],
});
```

### Instance Options

For each dialog instance you open you can specify all the global options and also the following 3 options.

- `id` - The modal unique id (defaults to random id).
- `vcr` - A custom `ViewContainerRef` to use.
- `data` - A `data` object that will be passed to the modal template or component.

```ts
this.dialog.open(compOrTemplate, {
  //...
  // all global options expect sizes
  //...
  id: string,
  vcr: ViewContainerRef,
  data: {},
});
```

### Enable close
The `enableClose` property can be configured for each dialog. 
If set to `true`, clicking on the backdrop or pressing the escape key will close the modal. 
If set to `false`, this behavior will be disabled.

Additionally, the property can be set to the string value `'onlyLastStrategy'`. 
In this case, the behavior will only apply to the last dialog that was opened, and not to any other dialog. 
By default, this should be the top-most dialog and behave as `true`.

## Custom Sizes

The default `sizes` config is:

```ts
{
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
 }
}
```

You can override it globally by using the `sizes` option:

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideDialogConfig({
      sizes: {
        sm: {
          width: 300, // 300px
          minHeight: 250, // 250px
        },
        md: {
          width: '60vw',
          height: '60vh',
        },
        lg: {
          width: '90vw',
          height: '90vh',
        },
        fullScreen: {
          width: '100vw',
          height: '100vh',
        },
      },
    }),
  ],
});
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
    }
  }
}
```
