import { IUserData } from './../../../../_models/message';
import { AccountService } from './../../../../providers/account/account';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, PopoverController } from 'ionic-angular';
import { Electron } from './../../../../providers/electron/electron';
import { ChatService, IChatRoom, IRoomMessages, IChatRoomData } from '../../../../providers/chat.service';
import { BizFireService } from '../../../../providers';
import { User } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { IUser } from '../../../../_models/message';
import { filter, take } from 'rxjs/operators';
import firebase from 'firebase';
import { AlertProvider } from '../../../../providers/alert/alert';

export interface Ichats {
  message: string,
}
export interface IchatMember{
  name: string,
  photoURL: string,
}
 
@IonicPage({  
  name: 'page-member-chat',
  segment: 'member-chat',
  priority: 'high'
})
@Component({
  selector: 'page-member-chat',
  templateUrl: 'member-chat.html',
})
export class MemberChatPage {

  @ViewChild(Content) contentArea: Content;

  private _unsubscribeAll;
  editorMsg = '';
  opacity = 100;

  message : string;
  messages = [];
  readMessages : IRoomMessages[];
  chatroom : IChatRoom;
  room_type : string = "chatRoom";
  ipc : any;
  roomData : IChatRoomData;
  chatMembers = [];

  // room info
  roomMembers: IUser[];
  roomCount : number;
  chatTitle = '';
  logout : any;
  fileSpinner = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public chatService : ChatService,
    public bizFire : BizFireService,
    public electron: Electron,
    public accountService : AccountService,
    public afAuth: AngularFireAuth,
    public popoverCtrl :PopoverController,
    public alertCtrl: AlertProvider
    ) {
      this.afAuth.authState.subscribe((user: User | null) => {
        if(user == null){
          this.windowClose();
        }
      })
      // esc 버튼 클릭시 채팅창 닫기. node_module keycode
      document.addEventListener('keydown', event => {
        if(event.key === 'Escape' || event.keyCode === 27){
          this.electron.windowClose();
        }
      })
      this.ipc = electron.ipc;
    }
  

  ngOnInit(): void {
    console.log(this.chatroom);
    this.chatroom = this.navParams.get('roomData');

    if(this.chatroom != null) {
      // // * get USERS DATA !
      const c_members = this.chatroom.data.members;
      this.chatMembers = Object.keys(c_members).filter(uid => c_members[uid] === true && uid != this.chatroom.uid);
      console.log(this.chatMembers);
      this.accountService.getAllUserInfos(this.chatMembers).pipe(filter(m => m != null),take(1))
      .subscribe(members => {
        this.roomMembers = members.filter(m => m != null);
        this.chatTitle = '';
        this.roomCount = Object.keys(members).length + 1;
        this.roomMembers.forEach(m => {
          this.chatTitle += m.data.displayName + ",";
        })
      })

      // 채팅방 정보 가져오기
      this.bizFire.afStore.doc(`chats/${this.chatroom.cid}`).valueChanges().subscribe((roomData : IChatRoomData) => {
        this.roomData = roomData;
        let chatMembers = [];
        chatMembers = Object.keys(roomData.members).filter(uid => roomData.members[uid] === true && uid != this.chatroom.uid);
        this.roomCount = Object.keys(roomData.members).length;

        this.accountService.getAllUserInfos(chatMembers).pipe(filter(m => m != null),take(1))
        .subscribe(members => {
          this.roomMembers = members.filter(m => m != null);
          this.chatTitle = '';
          this.roomMembers.forEach(m => {
            this.chatTitle += m.data.displayName + ",";
          })
        })
      })


      // 입력한 메세지 배열에 담기. 누군가 메세지를 입력했다면 라스트 리드 업데이트
      this.bizFire.afStore.collection(`chats/${this.chatroom.cid}/chat`, ref => ref.orderBy('created',"asc"))
      .stateChanges().subscribe(snap => {
        snap.forEach(d => {
          const msgData = {rid: d.payload.doc.id, data:d.payload.doc.data()} as IRoomMessages;
          if(d.type == 'added' && msgData.data.message != '' || msgData.data.notice === 1){
            this.messages.push(msgData);
          }
          if(d.type == 'modified'){
            let ret = msgData.data.files != null && msgData.data.message != '';
            if(ret){
              this.messages.push(msgData);
            }
          }
        })
        this.onFocus();
        this.chatService.updateLastRead("member-chat-room",this.chatroom.uid,this.chatroom.cid);
      })

      // 드래그해서 파일 첨부 기능.
      const drag_file = document.getElementById('drag-file');
      drag_file.addEventListener('drop',(e) => {
        e.preventDefault();
        e.stopPropagation();
        let data = e.dataTransfer;
        if(data.items){
          for (var i=0; i < data.files.length; i++) {
              console.log(data.files[i]);
              this.dragFile(data.files[i]);
            }
        }
      })
      // angular keydown.enter는 이벤트가 두번실행 되므로 이벤트 리스너로 대체 해결.
      drag_file.addEventListener('keydown',(e) => {
        if(e.key === 'Escape' || e.keyCode === 13){
          this.sendMsg();
        }
      })
    }
    // this.chatService.createRoom(null);
  }
  file(file){
    let fileInfo;
    fileInfo = file.target.files[0];
    if(file.target.files.length === 0 ) {
      return;
    }
    if(file && file.target.files[0].size > 10000000){
      this.electron.showErrorMessages("Failed to send file.","sending files larger than 10mb.");
      return;
    } else {
      this.chatService.sendMessage("member-chat",fileInfo.name,this.chatroom.cid,this.chatroom.data.gid,fileInfo);
    }
  }
  dragFile(file){
    console.log(file.size);
    console.log(file.name);
    if(file.length === 0 ) {
      return;
    }
    if(file && file.size > 10000000){
      this.electron.showErrorMessages("Failed to send file.","sending files larger than 10mb.");
      return;
    } else {
      this.chatService.sendMessage("member-chat",file.name,this.chatroom.cid,this.chatroom.data.gid,file);
    }
  }
  smile(){
    console.log(this.editorMsg);
  }
  videoCall(){
    const path = `users/${this.chatMembers[0]}`;
    this.bizFire.afStore.doc(path).get().subscribe(snap => {
      let selectUserData:IUserData;
      if(snap.exists){
        selectUserData = snap.data();
        if(selectUserData.onlineStatus == 'online' && selectUserData.videoCall == false || selectUserData.videoCall == null){
          this.bizFire.afStore.doc(path).set({
            videoCall : true
          },{merge: true}).then(() => {
              this.electron.openVedioRoom();
          })
        } else {
          this.alertCtrl.logoutSelectUser();
        }
      }
    })
  }

  sendMsg() {
    let clear = '';
    console.log(this.editorMsg,this.editorMsg.length);
    let resultString = this.editorMsg.replace(/(^\s*)|(\s*$)/g, '');
    resultString = resultString.replace('\n', '');
    console.log(this.editorMsg, this.editorMsg.length);
    // 앞, 뒤 공백제거 => resultString

    this.editorMsg = '';

    if(resultString.length > 0){

      const now = new Date();
      const lastmessage = new Date(this.roomData.lastMessageTime * 1000);

      if(resultString != '' && now.getDay() <= lastmessage.getDay()){
        this.chatService.sendMessage("member-chat",resultString,this.chatroom.cid);
      } else if(resultString != '' && now.getDay() > lastmessage.getDay() || this.roomData.lastMessageTime == null) {
        this.chatService.writeTodayAndSendMsg("member-chat",resultString,this.chatroom.cid);
      }
    }

    
  }

  // 
  opacityChanges(v){
    this.electron.setOpacity(v);
  }

  downloadFile(path){
    console.log(path);
    this.ipc.send('loadGH',path);
  }

  presentPopover(ev): void {
    let popover = this.popoverCtrl.create('page-member-chat-menu',{roomData : this.chatroom}, {cssClass: 'page-member-chat-menu'});
    popover.present({ev: ev});
  }

  scrollToBottom() {
      if (this.contentArea.scrollToBottom) {
        this.contentArea.scrollToBottom();
      }
  }
  onFocus() {
    this.contentArea.resize();
    this.scrollToBottom();
  }
  scrollToBottomN(){
    const element = document.getElementById('last');
    element.scrollIntoView();
  }
  ngAfterViewChecked(){
    this.onFocus();
  }

  windowClose() {
    this.electron.windowClose();
  }

  windowMimimize() {
    this.electron.windowMimimize();
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
