import { GroupColorProvider } from './../../providers/group-color';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController,PopoverController } from 'ionic-angular';
import { Electron } from './../../providers/electron/electron';
import { BizFireService } from '../../providers';
import {Subject, of, Subscription, timer} from 'rxjs';
import { filter, takeUntil, map, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../providers/notification.service';
import { ChatService } from '../../providers/chat.service';
import { SquadService, ISquad } from '../../providers/squad.service';
import { TokenProvider } from '../../providers/token/token';
import {Commons, STRINGS} from "../../biz-common/commons";
import { LangService } from '../../providers/lang-service';
import {IBizGroup, INotification, IUnreadItem, IUserData} from "../../_models";
import {IChat, IChatData} from "../../_models/message";
import {Chat} from "../../biz-common/chat";
import {IUnreadMap, MapItem, UnreadCounter} from "../tab/chat/unread-counter";

@IonicPage({
  name: 'page-tabs',
  segment: 'tabs',
  priority: 'high'
})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {


  private _unsubscribeAll;

  groupList; // display Select
  memberNewMessage = 0;
  squadNewMessage = 0;
  squadChatRooms: ISquad[];
  group: IBizGroup;

  chatRooms = [];

  groupMainColor: string;

  // right button display
  displayName;

  // 알람 개수 카운트 - 값이 0일 경우 표시 안됨.
  notification = 0;
  messages: INotification[];
  notifyCount: number = 0;

  isPartner = false;

  tab1Root = 'page-home';
  tab2Root = 'page-squad';
  tab3Root = 'page-chat';
  tab4Root = 'page-notify';
  tab5Root = 'page-member';

  langPack: any;

  chatCount = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electron: Electron,
    private bizFire: BizFireService,
    public popoverCtrl :PopoverController,
    public chatService: ChatService,
    private squadService: SquadService,
    public groupColorProvider : GroupColorProvider,
    private tokenService: TokenProvider,
    private unreadCounter: UnreadCounter,
    private noticeService : NotificationService,
    private langService: LangService,
    ) {
      // test notification count
      this._unsubscribeAll = new Subject<any>();

    // 채팅이 아닌 메인 윈도우를 우클릭으로 완전 종료시 유저상태변경하는 리스너.
    window.addEventListener('unload', () => {
      this.bizFire.signOut();
      // this.userStatusService.windowCloseAndUserStatus().then(() => {
      //     this.bizFire.signOut();
      // });
    });

    this.bizFire.onUserSignOut
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(()=>{
      this.clear();
    });
  }

  ngOnInit() {

    this.langService.onLangMap
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((l: any) => {
        this.langPack = l;
    });

    this.noticeService.onNotifications
      .pipe(takeUntil(this._unsubscribeAll),filter(m=> m!=null))
      .subscribe(async (m: INotification[]) => {
        const unreadNotify = m.filter(n => n.data.statusInfo.done === false);
        console.log("unreadNotify :::",unreadNotify);
        this.notifyCount = unreadNotify.length;
      });

    this.bizFire.onBizGroupSelected
    .pipe(filter(d=>d!=null),takeUntil(this._unsubscribeAll),
        switchMap(group => {

          // 그룹에서 탈퇴당하거나 그룹이 비활성화 되면...
          if(!group.data.members[this.bizFire.uid] && group.data.status === false) {
            this.goGroupList();
          }

            //* have group changed?
            let reloadGroup = true;
            if(this.group != null){
                reloadGroup = this.group.gid !== group.gid;
            }

            this.group = group;
            this.groupMainColor = this.groupColorProvider.makeGroupColor(this.group.data.team_color);
            this.isPartner = this.bizFire.isPartner(group);

            console.log("언리드 모니터 시작");
            // 모든 채팅의 UNREAD COUNT 를 모니터

            if(reloadGroup === true){
                // group squads reloading...
                return this.squadService.getMySquadLisObserver(this.group.gid);
            } else {
                // gid not changed.
                return of(null);
            }
        }),
        takeUntil(this._unsubscribeAll),
      filter(l => l != null) // prevent same group reloading.
    ).subscribe((list : IChat[]) => {
      console.log("스쿼드 리스트 :",list);
      const newChat = list.map(l => {
        return new Chat(l.sid , l.data, this.bizFire.uid, l.ref);
      });

      this.squadService.onSquadListChanged.next(newChat);

    });


    this.chatService.unreadCountMap$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((list: IUnreadMap) => {
        list.getValues().forEach((item : MapItem) => {
          this.chatCount += item.unreadList.length;
          this.electron.setAppBadge(this.chatCount);
        });
    });

    this.bizFire.afStore.collection(Commons.chatPath(this.group.gid),ref =>{
        return ref.where('status', '==' ,true).where(`members.${this.bizFire.currentUID}`, '==', true);
    })
    .stateChanges()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((changes : any) => {
      changes.forEach(change => {
        const data = change.payload.doc.data();
        const mid = change.payload.doc.id;

        if(change.type === 'added') {
          const item = new Chat(mid, data, this.bizFire.uid, change.payload.doc.ref);
          this.chatRooms.push(item);
          if(this.unreadCounter){
            this.unreadCounter.register(mid, item);
          }

        } else if(change.type === 'modified') {
          for(let index = 0 ; index < this.chatRooms.length; index ++){
            if(this.chatRooms[index].cid === mid){
              // find replacement
              const item = new Chat(mid, data, this.bizFire.uid, change.payload.doc.ref);

              //---------- 껌벅임 테스트 -------------//
              this.chatRooms[index] = item; // data 만 경신 한다.
              console.log("Type Modified : ",this.chatRooms[index]);
              //-----------------------------------//

              break;
            }
          }
        } else if (change.type === 'removed') {
          for (let index = 0; index < this.chatRooms.length; index++) {
            if (this.chatRooms[index].cid === mid) {
              // remove from array
              this.chatRooms.splice(index, 1);
              if(this.unreadCounter){
                this.unreadCounter.unRegister(mid);
              }
              break;
            }
          }
        }
      });
      this.chatService.onChatRoomListChanged.next(this.chatRooms);

    });
  }

  presentPopover(ev): void {
    let popover = this.popoverCtrl.create('page-menu',{}, {cssClass: 'page-menu'});
    popover.present({ev: ev});
  }

  goGroupList() {
    this.navCtrl.setRoot('page-group-list').catch(error => console.error(error));
  }

  windowHide() {
    this.electron.windowHide();
  }

  windowMimimize() {
    this.electron.windowMimimize();
  }

  // side menu toggle
  // onSideMenu() {
  //   this.menuCtrl.open();
  // }
  clear(){

    //just unsubscribe old one.
    if(this.unreadCounter){

      // unreadCounter 가 보내는 현 그룹의 언리드 리스트인
      // unreadList$ 가 받는 구독을 먼저 해제한다.
      // 데이터를 지운다.
      this.unreadCounter.clear();
      this.unreadCounter = null; // always create new one with new GID.
    }
  }

  ngOnDestroy(): void {
    this.clear();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.squadNewMessage = 0;
    this.memberNewMessage = 0;

    // tabs페이지를 벗어날때 = 그룹변경 , 로그아웃 등.
    this.electron.setAppBadge(0);

    //캐시초기화를 위해 null
    this.bizFire.onBizGroupSelected.next(null);
  }

}
