<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>

<br />

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
[![ngneat](https://img.shields.io/badge/@-ngneat-383636?style=flat-square&labelColor=8f68d4)](https://github.com/ngneat/)
[![spectator](https://img.shields.io/badge/tested%20with-spectator-2196F3.svg?style=flat-square)]()

> The Library Slogan

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid assumenda atque blanditiis cum delectus eligendi ipsam iste iure, maxime modi molestiae nihil obcaecati odit officiis pariatur quibusdam suscipit temporibus unde.
Accusantium aliquid corporis cupiditate dolores eum exercitationem illo iure laborum minus nihil numquam odit officiis possimus quas quasi quos similique, temporibus veritatis? Exercitationem, iure magni nulla quo sapiente soluta. Esse?

## Features

- ✅ One
- ✅ Two
- ✅ Three

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [FAQ](#faq)

## Installation

### NPM

`npm install @ngneat/dialog --save-dev`

### Yarn

`yarn add @ngneat/dialog --dev`

## Usage

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid assumenda atque blanditiis cum delectus eligendi ipsam iste iure, maxime modi molestiae nihil obcaecati odit officiis pariatur quibusdam suscipit temporibus unde.

```ts
import { DialogModule } from '@ngneat/dialog';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DialogModule.forRoot(
      // You can set sizes
      {
        // sm is the dafault size when sizes are configured
        sm: {
          width: '300px',
          height: '250px'
        },
        md: {
          width: '60vw',
          height: '60vh'
        },
        lg: {
          // This's the size of fullScreen
          width: '90vw',
          height: '90vh'
        }
      }
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Now you can use it.

## Examples

You can use a TemplateRef or a Component:

### Using a TemplateRef

```ts
import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DialogService } from '@ngneat/dialog';

@Component({
  selector: 'app-root',
  template: `
    <ng-template #template let-ref let-data="data">
      <h1>{{ data.title }}</h1>
      <p>{{ ref.data.content }}</p>

      <button (click)="ref.close()">Close</button>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('template', { static: true })
  tmpl: TemplateRef<any>;

  constructor(private dialog: DialogService) {}

  ngOnInit() {
    this.dialog.open(this.tmpl, {
      data: {
        title: 'Example dialog',
        content: 'This is a test dialog'
      }
    });
  }
}
```

### Using a Component

```ts
import { DialogService, DialogRef, DIALOG_DATA } from '@ngneat/dialog';

@Component({
  selector: 'app-dialog-test',
  template: `
    <h1>{{ ref.data.title }}</h1>

    <p class="content">
      {{ data.content }}
    </p>

      <div class="buttons">
        <button (click)="ref.close()">Close</button>
      </div>
    </div>
  `,
  styles: [
    `
      h1 {
        border-bottom: 1px solid black;
        padding: 18px;
      }

      .content {
        padding: 18px;
        padding-top: 0;
      }

      .buttons {
        text-align: right;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent implements OnInit {
  constructor(public ref: DialogRef, @Inject(DIALOG_DATA) public data: any) {}

  ngOnInit() {
    console.log(`Dialog with ID ${this.ref.id} opened`);
  }
}

@Component({
  selector: 'app-root',
  template: ``
})
export class AppComponent implements OnInit {
  constructor(private dialog: DialogService) {}

  ngOnInit() {
    this.dialog.open(TestComponent, {
      data: {
        title: 'Example dialog',
        content: 'This is a test dialog'
      }
    });
  }
}
```

### DialogRef

When you open a dialog, it returns a `DialogRef`:

```ts
@Component({
  selector: 'app-root',
  template: ``
})
export class AppComponent implements OnInit {
  constructor(private dialog: DialogService) {}

  ngOnInit() {
    const dialogRef = this.dialog.open(TestComponent, {
      data: {
        title: 'Example dialog',
        content: 'This is a test dialog'
      }
    });

    let dialogMustBeOpen = true;

    dialogRef.backdropClick$.subscribe({
      next: () => console.log('Backdrop has been clicked')
    });

    dialogRef.beforeClose$.subscribe({
      next: cancel => {
        console.log('You can abort the close');

        if (dialogMustBeOpen) {
          cancel();
        }
      }
    });

    dialogRef.afterClosed$.subscribe({
      next: () => console.log('After dialog has been closed')
    });

    // Allow to close the dialog only after 5s
    timer(5_000).subscribe({ next: () => (dialogMustBeOpen = false) });
  }
}
```

### Some options

#### container

```ts
@Component({
  selector: 'app-root',
  template: `
    <div #container>The dialog will be placed here</div>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('container', { static: true })
  private container: ElementRef<HTMLDivElement>;

  constructor(private dialog: DialogService) {}

  ngOnInit() {
    this.dialog.open(TestComponent, {
      container: this.container,
      data: {
        title: 'Dialog into container',
        content: 'This is a test dialog'
      }
    });
  }
}
```

#### backdrop

```ts
@Component({
  selector: 'app-root',
  template: ``
})
export class AppComponent implements OnInit {
  constructor(private dialog: DialogService) {}

  ngOnInit() {
    this.dialog.open(TestComponent, {
      // backdropClick$ will point to document.body
      backdrop: false,
      data: {
        title: 'Dialog without backdrop',
        content: 'This is a test dialog'
      }
    });
  }
}
```

#### draggable

```ts
@Component({
  selector: 'app-root',
  template: ``
})
export class AppComponent implements OnInit {
  constructor(private dialog: DialogService) {}

  ngOnInit() {
    this.dialog.open(TestComponent, {
      draggable: true,
      data: {
        title: 'Draggable dialog',
        content: 'This is a test dialog'
      }
    });
  }
}
```

## Styling

You can customize the styles with this classes:

```scss
ngneat-dialog {
  .ngneat-dialog-container {
    // dialog container
    .ngneat-dialog-content {
      // dialgo content, where your component/template is placed
      &.ngneat-dialog-fullscreen {
        // when dialog is fullScreen
      }
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

## FAQ

## How to ...

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid assumenda atque blanditiis cum delectus eligendi ips

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
