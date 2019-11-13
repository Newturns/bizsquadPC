import { Component } from '@angular/core';
import {NavParams, ViewController} from "ionic-angular";
import {TakeUntil} from "../../biz-common/take-until";
import {BizFireService} from "../../providers";
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";




@Component({
  selector: 'change-title-popover',
  templateUrl: 'change-title-popover.html'
})
export class ChangeTitlePopoverComponent extends TakeUntil {

  title : string;

  langPack = {};

  changeTitleForm: FormGroup;

  private titleValidator: ValidatorFn = Validators.compose([
    Validators.required,
  ]);

  constructor(private navParams: NavParams,
              private viewCtrl: ViewController,
              private bizFire : BizFireService,
              private formBuilder: FormBuilder,) {
    super();

    // 채팅방 제목 받음.
    this.title = this.navParams.get('title');

    this.bizFire.onLang
    .pipe(this.takeUntil)
    .subscribe((l: any) => {
      this.langPack = l.pack();
    });
  }

  ngOnInit(): void {
    this.changeTitleForm = this.formBuilder.group({
      title: [this.title, this.titleValidator],
    });
  }

  closePopup(){
    this.viewCtrl.dismiss(false);
  }

  changeTitle() {
    this.viewCtrl.dismiss(this.changeTitleForm.value['title']);
  }
}
