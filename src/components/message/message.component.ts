import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {IMessage} from "../../_models/message";
import {IUser} from "../../_models";
import {BizFireService} from "../../providers";
import {CacheService} from "../../providers/cache/cache";
import {Commons} from "../../biz-common/commons";

@Component({
  selector: 'app-message',
  templateUrl: 'message.component.html'
})

export class MessageComponent implements OnInit, OnDestroy {

  @Input()
  showUnreadCount = false;
  unreadCount: number; // read user
  unreadUsers: string[];

  // show delete/edit menu
  @Input()
  menu = false;

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

  @Input()
  comment = false;

  private _unsubscribeAll;
  shortName; // 'YO'
  displayName ='';
  photoURL;
  text: string;

  langPack = {};

  currentUserData: IUser;

  commentCount = 0; // get realtime comments.

  @Output()
  onComment = new EventEmitter<any>();

  @Output()
  onMenu = new EventEmitter<any>();

  // css my message style.
  isMyMessage = false;

  // notice message observer
  // use to display notice
  private noticeMessageSubject = new BehaviorSubject<string>('loading...');

  constructor(public bizFire: BizFireService,
              private cacheService: CacheService,
  ) {
    this._unsubscribeAll = new Subject<any>();
  }

  ngOnInit() {

    this.bizFire.onLang
      .pipe(filter(g=>g!=null),
        takeUntil(this._unsubscribeAll))
      .subscribe((l: any) => {
        this.langPack = l.pack('squad');
      });

    if(this.comment === true){

      if(this.message.ref){
        this.bizFire.afStore.doc(this.message.ref.path).collection('chat')
          .snapshotChanges()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(changes => this.commentCount = changes.length);

      } else {

        console.error('this.message.ref is null.');
      }
    }

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private loadMessage(message: IMessage) {

    if(message.data.isNotice){
      // just show message and do nothing.
      return;
    }

    this.text = this.convertMessage(message);

    // async get user's info include me.
    const uid = this._message.data.sender;


    if(uid){
      // get photoURL
      this.isMyMessage = uid === this.bizFire.uid;

      this.cacheService.userGetObserver(uid)
        .pipe(takeUntil(this._unsubscribeAll), takeUntil(this.bizFire.onUserSignOut))
        .subscribe(user =>{
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

  private calcUnreadCount (){
    if(this.showUnreadCount && this.message && this.message.data.read){

      const readUserId = Object.keys(this.message.data.read)
        .filter(uid => this.message.data.sender!== uid)
        .filter(uid => this.message.data.read[uid].unread === false);

      if(readUserId.length > 0){
        this.cacheService.resolvedUserList(readUserId, Commons.userInfoSorter)
          .subscribe((list: IUser[]) => {
            this.unreadUsers = list.map(l => l.data.displayName);
            this.unreadCount = this.unreadUsers.length;
          });
      }
    }
  }

  private convertMessage(message: IMessage): string {

    let ret: string = '';
    if(message.data.message && message.data.message.text){
      let text = message.data.message.text;

      ret = text;

    }
    return ret;
  }

  isImageFile(file: any): boolean {
    return Commons.isImageFile(file);
  }

  private setUserInfo(user: IUser){
    this.currentUserData = user;
    this.displayName = user.data.displayName || user.data.email || '';
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
