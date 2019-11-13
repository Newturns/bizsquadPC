import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { Electron } from '../../../../providers/electron/electron';
import { AlertProvider } from '../../../../providers/alert/alert';
import {IChat} from "../../../../_models/message";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ChatService} from "../../../../providers/chat.service";
import {BizFireService} from "../../../../providers";
import {TakeUntil} from "../../../../biz-common/take-until";

@IonicPage({
  name: 'page-member-chat-menu',
  segment: 'member-chat-menu',
  priority: 'high'
})
@Component({
  selector: 'page-member-chat-menu',
  templateUrl: 'member-chat-menu.html',
})
export class MemberChatMenuPage extends TakeUntil {

  selectChatRoom : IChat;
  langPack: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electron: Electron,
    public popoverCtrl :PopoverController,
    private chatService : ChatService,
    public bizFire : BizFireService,
    public alertCtrl : AlertProvider,) {

    super();

    this.bizFire.onLang
      .pipe(this.takeUntil)
      .subscribe((l: any) => {
        this.langPack = l.pack();
      });
  }


  ngOnInit(): void {

    this.chatService.onSelectChatRoom
      .pipe(this.takeUntil)
      .subscribe((chat : IChat) => {
        this.selectChatRoom = chat;
    })

  }

  Invite(ev){
    let popover = this.popoverCtrl.create('page-invite-room',{}, {cssClass: 'page-invite-room'});
    popover.present({ev: ev}).then(() => this.viewCtrl.dismiss());
  }

  changeTitle(ev) {
    //클릭한 메뉴 버튼의 이름을 chat-header(채팅해더)로 전달.
    this.viewCtrl.dismiss('title');
  }

  leaveChatRoom(){
    this.viewCtrl.dismiss('leave');
    // this.alertCtrl.leaveRoomAlert(this.bizFire.uid,this.selectChatRoom.data.gid,this.selectChatRoom.cid);
  }

  ngOnDestroy(): void {
  }
}
