import { Component } from '@angular/core';


@Component({
  selector: 'warn-popover',
  templateUrl: 'warn-popover.html'
})

export class WarnPopoverComponent {

  text: string;

  constructor() {
    console.log('Hello WarnPopoverComponent Component');
    this.text = 'Hello World';
  }

}
