import {Component, Input, OnInit} from '@angular/core';
import {filter, takeUntil} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {TakeUntil} from "../../biz-common/take-until";
import {IMessage} from "../../_models/message";
import {BizFireService} from "../../providers";
import {CacheService} from "../../providers/cache/cache";
import {IUser} from "../../_models";


@Component({
  selector: 'biz-chat-notice',
  templateUrl: './chat-notice.component.html',
})
export class ChatNoticeComponent extends TakeUntil implements OnInit {

  @Input()
  message: IMessage;

  langPack = {};

  // use to display notice
  private noticeMessageSubject = new BehaviorSubject<string>('hello');

  constructor(private bizFire : BizFireService,
              private cacheService : CacheService) {
    super();
    this.bizFire.onLang
    .pipe(filter(g=>g!=null),this.takeUntil)
    .subscribe((l: any) => {
      this.langPack = l.pack('squad');
    });
  }

  ngOnInit() {
  }

  makeNoticeMessage(): Observable<string> {

    if(Object.keys(this.langPack).length > 0
      && this.message
      && this.message.data.isNotice
      && this.message.data.message.notice
    ){
      const notice = this.message.data.message.notice;
      if(notice.type === 'exit'){
        const uid = notice.uid;
        if(uid){
          this.cacheService.userGetObserver(uid[0]).subscribe((user: IUser) => {
            if(user){
              const text = this.langPack['chat_exit_user_notice'].replace('$DISPLAYNAME', user.data.displayName);
              this.noticeMessageSubject.next(text);
            }
          });
        }
      }

      if(notice.type === 'init'){
        const text = this.langPack['create_chat_room'];
        this.noticeMessageSubject.next(text);
      }
      if(notice.type === 'invite'){
        const uids = notice.uid;
        let inviteUserNames = '';
        for(let uid of uids) {
          this.cacheService.userGetObserver(uid).subscribe((user : IUser) => {
            if(user.data.displayName) {
              if(inviteUserNames.length > 0){
                inviteUserNames += ',';
              }
              inviteUserNames += user.data.displayName;
            }
          })
        }
        const text = this.langPack['chat_invite_user_notice'].replace('$DISPLAYNAME',inviteUserNames);
        this.noticeMessageSubject.next(text);
      }
    }

    return this.noticeMessageSubject.asObservable();
  }

}
