import { Component } from '@angular/core';




@Component({
  selector: 'change-title-popover',
  templateUrl: 'change-title-popover.html'
})
export class ChangeTitlePopoverComponent {

  text: string;

  constructor() {
    console.log('Hello ChangeTitlePopoverComponent Component');
    this.text = 'Hello World';
  }

}
