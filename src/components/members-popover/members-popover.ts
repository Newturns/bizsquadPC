import { Component } from '@angular/core';
import {Commons} from "../../biz-common/commons";
import {Observable} from "rxjs";
import {IBizGroup, IUser} from "../../_models";
import {CacheService} from "../../providers/cache/cache";
import {ChatService} from "../../providers/chat.service";
import {IChat} from "../../_models/message";
import {BizFireService} from "../../providers";
import {map} from "rxjs/operators";
import {ViewController} from "ionic-angular";
import {TakeUntil} from "../../biz-common/take-until";

@Component({
  selector: 'members-popover',
  templateUrl: 'members-popover.html'
})

export class MembersPopoverComponent extends TakeUntil {

  userInfos: IUser[];

  langPack = {};

  constructor(private chatService : ChatService,
              private cacheService : CacheService,
              public viewCtrl: ViewController,
              private bizFire : BizFireService) {
    super();

    this.bizFire.onLang
      .pipe(this.takeUntil)
      .subscribe((l: any) => {
        this.langPack = l.pack();
      });

    this.chatService.onSelectChatRoom.subscribe((chat : IChat) => {
      console.log("start member List !!");

      const userIdList = chat.isPublic() ? this.bizFire.currentBizGroup.getMemberIds(true) : chat.getMemberIds(true);

      this.cacheService.resolvedUserList(userIdList, Commons.userInfoSorter)
      .pipe(map(l => l.filter(ll => ll != null)))
      .toPromise()
      .then(list => {
        //console.log(list);
        this.userInfos = list;
        console.log(this.userInfos);
      });
    });
  }

  closePopup(){
    this.viewCtrl.dismiss();
  }

}
