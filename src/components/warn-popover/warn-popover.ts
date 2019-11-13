import { Component } from '@angular/core';
import {NavParams, ViewController} from "ionic-angular";


@Component({
  selector: 'warn-popover',
  templateUrl: 'warn-popover.html'
})

export class WarnPopoverComponent {

  title : string;

  description : string;


  constructor(private navParams: NavParams,
              private viewCtrl: ViewController) {
    this.title = this.navParams.get('title');
    this.description = this.navParams.get('description');
  }


  cancel() {
    this.viewCtrl.dismiss(false);
  }

  ok() {
    this.viewCtrl.dismiss(true);
  }

  closePopup(){
    this.viewCtrl.dismiss(false);
  }

}
