import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { BizFireService } from '../../../../providers/biz-fire/biz-fire';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GroupColorProvider } from '../../../../providers/group-color';
import { FormGroup, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { TokenProvider } from '../../../../providers/token/token';
import {IBizGroup} from "../../../../_models";

@IonicPage({
  name: 'page-customlink',
  segment: 'customlink',
  priority: 'high'
})
@Component({
  selector: 'page-customlink',
  templateUrl: 'customlink.html',
})
export class CustomlinkPage {

  langPack = {};

  private _unsubscribeAll;
  currentGroup: IBizGroup;
  groupMainColor: string;

  addLinkForm: FormGroup;

  private linkTitleValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.maxLength(10)
  ]);

  // URL 유효성 검사 정규식
  reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  private linkUrlValidator: ValidatorFn = Validators.compose([
    Validators.required,
  ]);

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public bizFire: BizFireService,
    public formBuilder: FormBuilder,
    public groupColorProvider: GroupColorProvider,
    private tokenService: TokenProvider
    ) {
    this._unsubscribeAll = new Subject<any>();

    this.bizFire.onLang
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((l: any) => {
      this.langPack = l.pack();
    });
  }

  ngOnInit(): void {

    this.addLinkForm = this.formBuilder.group({
      linkTitle: ['', this.linkTitleValidator],
      linkUrl: ['', this.linkUrlValidator],
    });

    this.bizFire.onBizGroupSelected
    .pipe(
        filter(g=>g!=null),
        takeUntil(this._unsubscribeAll))
    .subscribe((group) => {
        //console.log('onBizGroupSelected', group.gid);
        // set selected group to
        this.currentGroup = group;
        this.groupMainColor = this.groupColorProvider.makeGroupColor(this.currentGroup.data.team_color);
    });
  }

  submitAddLink() {
    if(this.addLinkForm.valid) {
      let linkUrl = this.addLinkForm.value['linkUrl'];
      if(linkUrl.indexOf('http') != -1) {
        console.log('http가 포함됨');
      } else {
        linkUrl = "https://".concat(linkUrl);
      }
      this.tokenService.addCustomLink(this.bizFire.currentUID,this.addLinkForm.value['linkTitle'],linkUrl)
      .then(() =>{
        this.closePopup();
      });
    }
  }

  closePopup(){
    this.viewCtrl.dismiss();
  }

}
