import { GroupColorProvider } from './../../../../providers/group-color';
import { Electron } from './../../../../providers/electron/electron';
import { ChatService } from './../../../../providers/chat.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { BizFireService } from '../../../../providers';
import { filter, takeUntil, map } from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import deepEqual from 'deep-equal';
import {IBizGroup, IUser, IUserData} from "../../../../_models";
import {IChat} from "../../../../_models/message";
import {Commons} from "../../../../biz-common/commons";
import {CacheService} from "../../../../providers/cache/cache";

@IonicPage({
  name: 'page-invite',
  segment: 'invite',
  priority: 'high'
})
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html',
})
export class InvitePage {

  private _unsubscribeAll;

  currentGroup: IBizGroup;
  isChecked : IUser[] = [];
  groupSubColor: string;

  langPack: any;

  userList$: Observable<IUser[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bizFire: BizFireService,
    public viewCtrl: ViewController,
    public chatService: ChatService,
    public electron : Electron,
    private cacheService : CacheService,
    public groupColorProvider: GroupColorProvider) {
      this._unsubscribeAll = new Subject<any>();

      this.bizFire.onLang
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((l: any) => {
          this.langPack = l.pack();
      });
  }

  ngOnInit(): void {

    this.bizFire.onBizGroupSelected
    .pipe(filter(g=>g!=null),takeUntil(this._unsubscribeAll))
    .subscribe((group) => {
      this.currentGroup = group;
      this.groupSubColor = group.data.team_subColor;
      this.userList$ = this.cacheService.resolvedUserList(this.currentGroup.getMemberIds(false), Commons.userInfoSorter);
    });

  }

  invite(){
    let chatRooms = this.chatService.getChatRooms();

    console.log("chatRooms",chatRooms);

    let selectedRoom: IChat;
    let members = {
      [this.bizFire.currentUID] : true
    };
    if(this.isChecked){
      this.isChecked.forEach(u => {
        members[u.uid] = true;
      })
    }
    for(let room of chatRooms) {
      const member_list = room.data.members;
      // 유저 키값이 false가 되면 리스트에서 제외하고 같은방이있는지 검사해야함.

      if(deepEqual(members,member_list)) {
        selectedRoom = room;
        break;
      }
    }
    if(this.isChecked.length > 0) {
      if(selectedRoom == null){
        this.chatService.createRoomByFabs(this.isChecked);
        this.viewCtrl.dismiss();
      } else {
        this.chatService.onSelectChatRoom.next(selectedRoom);
        this.electron.openChatRoom({cid: selectedRoom.cid, data: selectedRoom.data});
        this.viewCtrl.dismiss();
      }
    }
  }

  checkedUsers(user : IUser) {
    if(user['checked']) {
      user['checked'] = false;
    } else {
      user['checked'] = true;
      this.isChecked.push(user);
    }
    this.isChecked = this.isChecked.filter(user => user['checked'] === true);
    console.log(this.isChecked);
  }


  closePopup(){
    this.viewCtrl.dismiss();
  }

  ngOnDestroy(): void {
    this.isChecked.forEach(u => u['checked'] = false);
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
