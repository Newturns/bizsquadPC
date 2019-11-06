import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TakeUntil} from "../../biz-common/take-until";
import {IBizGroup, ICustomMenu} from "../../_models";
import {BizFireService} from "../../providers";

export interface IBizButton extends ICustomMenu {

}

@Component({
  selector: 'biz-button',
  templateUrl: './biz-button.component.html',
})
export class BizButtonComponent extends TakeUntil implements OnInit {

  @Input()
  title: string;

  @Input()
  set class(c: string){
    this._class += ` ${c}`;
  }
  get class(){
    return this._class;
  }

  private _class: string = 'biz-button';

  @Input()
  teamColor = false;


  @Input()
  disabled = false;

  @Input()
  warn = false;

  @Input()
  icon : boolean;

  @Input()
  primary = false;

  @Input()
  iconImgName : string = 'Icon_white_add.svg';

  //--------- 아직 사용 안함 ------//
  @Input()
  block: boolean;

  //----------------------------------

  group: IBizGroup;
  langPack = {};

  constructor(private bizFire: BizFireService) {
    super();
  }

  ngOnInit() {
    this.bizFire.onBizGroupSelected
      .pipe(this.takeUntil)
      .subscribe((g: any) => this.setGroup(g));

    if(this.title != null){
      if(this.title === 'ok'){
        this.teamColor = true;
      }
      this.bizFire.onLang
        .pipe(this.takeUntil)
        .subscribe((l: any) => {
          this.langPack = l.pack();
          const langTitle = this.langPack[this.title];
          // lang.ts found.
          if(langTitle != null){
            this.title = langTitle;
          }
        });
    }

    if(this.warn === true){
      this.teamColor = false;
    }
  }

  private setGroup(g: IBizGroup){
    this.group = g;
  }
}
