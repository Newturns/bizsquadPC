import {
  Component, ContentChild, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {TakeUntil} from "../../biz-common/take-until";
import {IUser, IUserData} from "../../_models";
import {BizFireService} from "../../providers";
import {CacheService} from "../../providers/cache/cache";

@Component({
  selector: 'app-avatar-button',
  templateUrl: './avatar-button.component.html',
})
export class AvatarButtonComponent extends TakeUntil implements OnInit {


  //default size = 40px;
  @Input()
  size: 20 | 30 | 32 | 36 | 40 | 64 | 80 = 40;

  @Input()
  displayNameOn = false;

  @Input()
  set uid(uid: string){
    if(uid){
      this.setUserData(uid, null);
    }
  }

  @Input()
  set user(user: IUser) {
    if (user != null) {
      this.setUserData(user.uid, user.data);
    }
  }

  get padding(): string {
    return this._padding;
  }

  @Input()
  set padding(value: string) {
    if(value && value.indexOf('px') === -1){
      value = `${value}px`;
    }
    this._padding = value;
  }
  private _padding = null; // padding from avatar to displayName

  @Input()
  set noPadding(no: boolean){
    if(no === true){
      this._padding = null;
    }
  }

  @Input()
  textColor = '#707c97';

  @Input()
  textDecoration = 'none';

  public userData: IUserData;

  private currentUserId: string;

  @Output()
  onClick = new EventEmitter<IUserData>();

  isMyMessage = false;
  photoURL: string;

  // padding from displayName to child ng-content
  @Input()
  childContentPadding = '0px';

  constructor(private bizFire: BizFireService,
              private cacheService: CacheService
  ) {
    super();
  }

  private setUserData(uid, userData: IUserData){

    this.currentUserId = uid;
    this.isMyMessage = uid === this.bizFire.uid;
    if(this.isMyMessage){

      this.setUser(this.bizFire.currentUserValue);

    } else {

      if(userData == null){
        // get user data from cache
        this.cacheService.userGetObserver(uid)
          .pipe(this.takeUntil)
          .subscribe((data: IUser) => {
            if(data != null){
              this.setUser(data.data);
            }
          });
      } else {
        this.setUser(userData);
      }
    }
  }

  private setUser(userData: IUserData){
    this.userData = userData;
    if(userData != null){
      const photoURL = userData.photoURL;
      if(photoURL){
        /*
        // 아바타 이름은 profile.jpeg 에서 자유형식으로 수정.
        // thumbnail 도 사용안함.
        if(photoURL.indexOf('profile.jpeg') !== -1){
          //photoURL 을 그대로 쓰지않고 썸네일을 표시한다.
          this.thumbUrl = photoURL.replace('profile.jpeg', 'thumb_512_profile.jpeg');
          this.photoURL = this.thumbUrl;
        }*/
        this.photoURL = photoURL;

      }

    } else {

      // deleted user.
    }
  }


  ngOnInit() {

    if(this.displayNameOn === true && this.padding == null){
      // set to default padding
      this._padding = '16px';
    }
  }

  /*
  * AVATAR 동그라미, 유저이름 클릭시 발생
  * */
  onNameClick(){
    // this object. Not a class.
    this.onClick.emit({uid: this.currentUserId, data: this.userData} as IUser);
  }

  /*
  * 썸네일이 없을시 에러.
  * */
  onError(e){

  }
}
