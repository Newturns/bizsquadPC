import {Component, Input, OnInit} from '@angular/core';
import {TakeUntil} from "../../biz-common/take-until";
import {IMessage} from "../../_models/message";
import {IBizGroup, IUser} from "../../_models";
import {BizFireService} from "../../providers";
import {CacheService} from "../../providers/cache/cache";
import {Commons} from "../../biz-common/commons";


@Component({
  selector: 'biz-message-balloon',
  templateUrl: './message-balloon.component.html',
})
export class MessageBalloonComponent extends TakeUntil implements OnInit {

  @Input()
  set message(msg: IMessage){
    this._message = msg;
    if(this._message){
      this.loadMessage(this._message);
    }
  }

  get message(){
    return this._message;
  }

  private _message: IMessage;
  public displayName;
  public photoURL;
  public text: string;
  public shortName : string;
  currentUserData: IUser;

  isMyMessage = false;

  readCount: number; // read user
  readUsers: string[];

  private group : IBizGroup;

  constructor(
    private bizFire : BizFireService,
    private cacheService : CacheService) {
    super();
  }

  ngOnInit() {
  }

  private loadMessage(message: IMessage) {

    this.group = this.bizFire.currentBizGroup;

    if(message.data.isNotice){
      // just show message and do nothing.
      return;
    }

    this.text = this.convertMessage(message);

    // async get user's info include me.
    const uid = this._message.data.sender;
    if(uid){
      // get photoURL
      this.isMyMessage = uid === this.bizFire.currentUID;

      this.cacheService.userGetObserver(uid)
        .pipe(this.takeUntil)
        .subscribe( (user:IUser) =>{
          if(user){
            this.setUserInfo(user);
          } else {
            // user not found from Firestore.
            this.photoURL = null;
            this.shortName = 'U';
            this.displayName = 'unknown user';
          }
        });
    }
    /*
    * Get Unread Count.
    * 현재는 라인식 읽은이들 수
    * */
    this.calcUnreadCount();
  }


  private convertMessage(message: IMessage): string {

    let ret: string = '';
    if (message.data.message && message.data.message.text) {
      let text = message.data.message.text;

      ret = text;
    }
    return ret;
  }


  private setUserInfo(user: IUser){
    this.currentUserData = user;
    this.displayName = user.data.displayName || user.data.email || '';
  }

  private calcUnreadCount (){
    if(this.message && this.message.data.read){

      const readUserId = Object.keys(this.message.data.read)
        .filter(uid => this.message.data.sender!== uid)
        .filter(uid => this.message.data.read[uid].unread === false);

      if(readUserId.length > 0){
        this.cacheService.resolvedUserList(readUserId, Commons.userInfoSorter)
          .subscribe((list: IUser[]) => {
            this.readUsers = list.map(l => l.data.displayName);
            this.readCount = this.readUsers.length;
          });
      }
    }
  }

  // 말풍선 스타일 클레스네임 텍스트를 리턴.
  groupColorBalloon(): string {
    if(this.group.data.team_color) {
      return 'balloon-style-'+Commons.getGroupColorStyleName(this.group.data.team_color);
    } else {
      return 'balloon-style-duskblue';
    }
  }

}
