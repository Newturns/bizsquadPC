import { AccountService } from './../../providers/account/account';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController,PopoverController } from 'ionic-angular';
import { Electron } from './../../providers/electron/electron';
import { BizFireService } from '../../providers';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';
import { IBizGroup } from '../../providers/biz-fire/biz-fire';
import { IUserData, INotification } from '../../_models/message';
import { NotificationService } from '../../providers/notification.service';
import { ChatService,IChatRoom } from '../../providers/chat.service';

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

  currentGroup: IBizGroup;
  currentUser: IUserData;
  groupList; // display Select
  currentGroupList: IBizGroup[];

  backgroundColor: string; // menu right string background color.

  // right button display
  displayName;

  // menu display Name;
  fullName;
  
  // on side menu
  sideMenu : boolean = true;

  // 알람 개수 카운트 - 값이 0일 경우 표시 안됨.
  notification = 0;
  messages: INotification[];
  chatRooms = [];
  badgeVisible = true;
  badgeCount = 0;
  chatCount = 0;

  isPartner = false;

  tab1Root = 'page-home';
  tab2Root = 'page-squad';
  tab3Root = 'page-chat';
  tab4Root = 'page-notify';
  tab5Root = 'page-member';

  

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public electron: Electron,
    private bizFire: BizFireService,
    public menuCtrl: MenuController,
    public popoverCtrl :PopoverController,
    private noticeService: NotificationService,
    public chatService: ChatService,
    public accountService : AccountService
    ) {
      // test notification count
      this._unsubscribeAll = new Subject<any>();
  }

  ngOnInit() {
    // * current User for RIGHT MENU
    this.bizFire.currentUser
        .pipe(filter(d=>d!=null), takeUntil(this._unsubscribeAll))
        .subscribe(user => {
            this.currentUser = user;
            this.displayName = this.bizFire.getDiplayNameInitial();
            this.fullName = user.displayName || user.email;
    });
    this.bizFire.onBizGroups
        .pipe(filter(g=>g!=null),
            takeUntil(this._unsubscribeAll))
        .subscribe((groups: IBizGroup[]) => {
            // save
            this.currentGroupList = groups;
        });
    this.bizFire.onBizGroupSelected
        .pipe(
            filter(g=>g!=null),
            takeUntil(this._unsubscribeAll))
        .subscribe((group) => {
            //console.log('onBizGroupSelected', group.gid);
            // set selected group to
            this.currentGroup = group;
            console.log(this.currentGroup);
            this.isPartner = this.bizFire.isPartner(group);
            // set select values.
            this.groupList = this.currentGroupList.filter(g => g.gid!==this.currentGroup.gid);
            // set menu font color.
            this.backgroundColor = this.currentGroup.data.team_color || '#5b9ced'; // default color is '#5b9ced';
        });

    // get number of unfinished notices.
    this.noticeService.onNotifications
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((msgs:INotification[]) => {
        // get unfinished notification count.
        this.badgeCount = msgs.filter(m => m.data.statusInfo.done !== true).length;
        this.badgeVisible = this.badgeCount > 0;
        this.messages = msgs.filter(m => m.data.gid === this.currentGroup.gid);
        this.notification = this.messages.filter(m => m.data.statusInfo.done !== true).length;
    });


    
    this.bizFire.afStore.collection("chats", ref => ref.where("gid","==",this.currentGroup.gid))
    .snapshotChanges()
    .pipe(takeUntil(this._unsubscribeAll),takeUntil(this.bizFire.onUserSignOut),
        map(rooms => rooms.filter(r=>{
                let ret = false;
                // this squad is a private s.
                const members = r.payload.doc.get('members');
                if(members){
                    ret = members[this.bizFire.currentUID] != undefined;
                }
                return ret;
            }).map(d => ({cid: d.payload.doc.id, data: d.payload.doc.data()} as IChatRoom))
        )
    ).pipe(takeUntil(this._unsubscribeAll)).subscribe((chatRooms) => {
        console.log(chatRooms);
        this.chatService.onChatRoomListChanged.next(chatRooms);

        if(this.chatService.onSelectChatRoom.value != null){
            const newChat = this.chatRooms.find(l => l.cid === this.chatService.onSelectChatRoom.value.cid);
            if(newChat){
                this.chatService.onSelectChatRoom.next(newChat);
            }
        }
    });
  }
  presentPopover(ev): void {
    let popover = this.popoverCtrl.create('page-menu',{}, {cssClass: 'page-menu'});
    popover.present({ev: ev});
  }

  goGroupList() {
    this.navCtrl.setRoot('page-group-list').catch(error => console.error(error));
  }

  windowClose() {
    this.bizFire.windowCloseAndUserStatus().then(() => {
      this.electron.windowClose();
    });
  }

  windowMimimize() {
    this.electron.windowMimimize();
  }

  // side menu toggle
  // onSideMenu() {
  //   this.menuCtrl.open();
  // }

  ngOnDestroy(): void {
    console.log("tabs destroy?")
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
