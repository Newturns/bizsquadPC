
import {OnDestroy} from '@angular/core';

import {Subscription} from 'rxjs';
import {TakeUntil} from "../biz-common/take-until";
import {IBizGroup} from "../_models";
import {BizFireService} from "../providers";

export class BizComponent extends TakeUntil implements OnDestroy{

  group: IBizGroup;
  langPack = {};


  private subLang: Subscription;
  private subGroup: Subscription;
  private subUserSignOut: Subscription;

  constructor(bizFire?: BizFireService) {
    super();
  }

  protected loadCleaner(bizFire: BizFireService){
    if(bizFire && this.subUserSignOut == null){
      this.subUserSignOut = bizFire.onUserSignOut
        .pipe(this.takeUntil)
        .subscribe(() => this.clear());
    }
  }

  protected loadAll(bizFire: BizFireService){
    this.loadBizGroup(bizFire);
    this.loadLang(bizFire);
    this.loadCleaner(bizFire);
  }

  protected loadLang(bizFire: BizFireService){
    if(bizFire && this.subLang == null){
      this.subLang = bizFire.onLang
        .pipe(this.takeUntil)
        .subscribe((l: any) => this.langPack = l.pack());
    }
  }

  protected loadBizGroup(bizFire: BizFireService){
    if(bizFire && this.subGroup == null){
      this.subGroup = bizFire.onBizGroupSelected
        .pipe(this.takeUntil)
        .subscribe((g: IBizGroup) => this.group = g);
    }
  }

  /*
  * Clear override
  * */
  protected clear(){
    this.unsubscribe();
    if(this.subUserSignOut){
      this.subUserSignOut.unsubscribe();
      this.subUserSignOut = null;
    }
    if(this.subLang){
      this.subLang.unsubscribe();
      this.subLang = null;
    }
    if(this.subGroup){
      this.subGroup.unsubscribe();
      this.subGroup = null;
    }
    this.group = null;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
