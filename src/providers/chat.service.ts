import { Electron } from './electron/electron';
import { Injectable } from '@angular/core';
import {BizFireService} from './biz-fire/biz-fire';
import {SquadService, ISquad} from './squad.service';
import {BehaviorSubject, Observable} from 'rxjs';
import { LoadingProvider } from './loading/loading';
import * as firebase from 'firebase';
import {Commons, STRINGS} from '../biz-common/commons';

import {LangService} from "./lang-service";
import {debounceTime, filter, takeUntil} from "rxjs/operators";
import {IChat, IChatData, IFiles, IMessage, IMessageData} from "../_models/message";
import {IUser} from "../_models";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../environments/environments";
import {Content} from "ionic-angular";
import {CacheService} from "./cache/cache";
import {IUnreadMap, UnreadCounter} from "../pages/tab/chat/unread-counter";

@Injectable({
    providedIn: 'root'
})

export class ChatService {

    var_chatRooms: any;

    onChatRoomListChanged = new BehaviorSubject<IChat[]>([]);

    onSelectChatRoom = new BehaviorSubject<IChat>(null);

    fileUploadProgress = new BehaviorSubject<number>(null);

    get unreadCountMap$(): Observable<IUnreadMap> {
      return this.unreadCounter.unreadChanged$.asObservable()
        .pipe(
          filter(d=>d!=null),
          debounceTime(500), // 0.5 sec
        );
    }

    langPack: any = {};

    constructor(
        public bizFire : BizFireService,
        public electron: Electron,
        private langService : LangService,
        private http: HttpClient,
        private cacheService : CacheService,
        private squadService: SquadService,
        private unreadCounter: UnreadCounter,
        private loading: LoadingProvider,) {

      this.langService.onLangMap
        .pipe(takeUntil(this.bizFire.onUserSignOut))
            .subscribe((l: any) => {
          this.langPack = l;
        });
    }
    getChatRooms(){
        let chatRooms = this.onChatRoomListChanged.getValue();
        chatRooms.forEach(room =>{
            const newData = room;
            newData['uid'] = this.bizFire.currentUID;
          });
        return chatRooms;
    }

    createRoomByProfile(target: IUser) {
        const now = new Date();
        const newRoom:IChatData = {
            created:  now,
            gid: this.bizFire.onBizGroupSelected.getValue().gid,
            members: {
                [this.bizFire.currentUserValue.uid] : true,
                [target.uid] : true
            },
            status: true,
            type: 'member'
        };

        this.createRoom(newRoom);
    }

    createRoomByFabs(isChecked) {

        const now = new Date();
        const myValue = this.bizFire.currentUserValue;
        // fabs invite에서 초대 한 멤버가 한명일 경우 그룹채팅이 아니다.

        const newRoom:IChatData = {
            created:  now,
            gid: this.bizFire.onBizGroupSelected.getValue().gid,
            members : {
                [myValue.uid] : true
            },
            status: true,
            type: 'member'
        };
        if(isChecked.length > 0){
          isChecked.forEach(u => { newRoom.members[u.uid] = true; });
        }

        console.log("newRoomnewRoom",newRoom);
        this.createRoom(newRoom);
    }

    createRoom(newRoom:IChatData) {
        if(newRoom != null){
            this.bizFire.afStore.collection(Commons.chatPath(newRoom.gid)).add(newRoom).then(room => {
                room.get().then(snap =>{

                  this.var_chatRooms = {
                    cid : snap.id,
                    data: snap.data(),
                  } as IChat;

                  this.makeRoomNoticeMessage('member-chat','init',newRoom.gid,snap.id)
                    .then(() => {
                      this.onSelectChatRoom.next(this.var_chatRooms);
                      this.electron.openChatRoom(this.var_chatRooms);
                    });
                })
            });
        }
    }

    getMessagePath(type,gid,id){
        switch(type){
            case 'member-chat':
              return Commons.chatMsgPath(gid,id);
            case 'squad-chat':
              return Commons.chatSquadMsgPath(gid,id);
            case 'member-chat-room':
              return Commons.chatDocPath(gid,id);
            case 'squad-chat-room':
              return Commons.chatSquadPath(gid,id);
        }
    }

    async addChatMessage(text: string, currentChat: IChat, files?: File[]) {

      if(currentChat.ref == null) {
        console.error('addChatMessage', currentChat);
        throw new Error('currentChat.ref is null.');
      }

      const members = currentChat.isPublic() ? this.bizFire.currentBizGroup.data.members : currentChat.data.members;

      const msg = await this.addMessage(text,currentChat.ref,members,files);

      const pushTitle = `[${this.bizFire.currentBizGroup.data.team_name}] ${this.bizFire.currentUserValue.displayName}`;
      const pushData = { cid: currentChat.cid, type: currentChat.data.type, gid: currentChat.data.gid };
      pushData.type = pushData.type === 'member' ? STRINGS.GROUP_CHAT : STRINGS.SQUAD_CHAT;
      console.log("pushDatapushData",pushData);

      this.sendPush(Commons.memberUID(members),pushTitle,this.convertMessage(text),pushData);

      return msg;
    }

    async addMessage(text: string,parentRef: any,unreadMembers : any,
                    files?: any[],saveLastMessage = true) {
      try{
        if(parentRef == null) {
          throw new Error('parentRef has no data.');
        }
        const membersUids = [];
        const now = new Date();
        const msg: IMessageData = {
          message: {
            text : text
          },
          sender: this.bizFire.uid,
          created: now,
          isNotice : false,
          read : null,
          type : 'chat',
          file: false
        };

        if(unreadMembers) {
          msg.read = Commons.makeReadFrom(unreadMembers, this.bizFire.uid);
          Object.keys(unreadMembers)
            .filter(uid => uid !== this.bizFire.uid)
            .forEach(uid => {
              membersUids.push(uid);
          })
        }

        const newChatRef = parentRef.collection('chat').doc();

        if(files && files.length > 0) {
          msg.file = true;
          const storageChatPath = parentRef.path;
          const mid = newChatRef.id;
          msg.message.files = [];
          const loads = files.map(async file => {
            const storagePath = `${storageChatPath}/chat/${mid}/${file.name}`;
            const storageRef = this.bizFire.afStorage.storage.ref(storagePath);
            const fileSnapshot = await storageRef.put(file);

            this.fileUploadProgress.next(fileSnapshot.bytesTransferred / fileSnapshot.totalBytes * 100);

            // get download url
            const downloadUrl = await fileSnapshot.ref.getDownloadURL();

            msg.message.files.push({
              name: file.name,
              size: file.size,
              type: file.type,
              url : downloadUrl,
              storagePath: storagePath
            } as IFiles)
          });
          await Promise.all(loads);
        }
        await newChatRef.set(msg);

        const newMessage = {mid: newChatRef.id, data: msg};

        if(saveLastMessage){
          await parentRef.update({
            lastMessage: msg,
          });
        }
        return newMessage;

      } catch (e) {
        console.log('addMessage',e,text);
        return null;
      }
    }

    makeRoomNoticeMessage(room_type,type,gid,cid,uid?) {

      const newMessage : IMessageData = {
        message: {
          notice: {
            type: type
          }
        },
        created: new Date(),
        isNotice: true,
        sender: this.bizFire.uid,
        type: 'chat'

      };

      if(uid){
        newMessage.message.notice.uid = uid;
      }
        return this.bizFire.afStore.firestore.collection(this.getMessagePath(room_type,gid,cid)).add(newMessage)
    }

    removeMember(uid,gid,cid) {
        return new Promise<void>( (resolve, reject) => {
            this.bizFire.afStore.firestore.doc(Commons.chatDocPath(gid,cid)).update({
                ['members.' + uid]: firebase.firestore.FieldValue.delete()
            }).then(()=>{
              // insert exit room message
              const text = this.langPack['chat_exit_user_notice'].replace('$DISPLAYNAME', this.bizFire.currentUserValue.displayName);
              this.makeRoomNoticeMessage('member-chat','exit',gid,cid,[this.bizFire.uid]).then(() => this.electron.windowClose());

              resolve();
            }).catch(error=>{
                reject(error);
            });
        });
    }

    async sendPush(targetUids: any[],pushTitle:any, msg:string, data: any){

      const payload = {
        notification: {
          title: pushTitle,
          body: msg,
        },
        data: {
          cid: data.cid,
          type: data.type,
          gid: data.gid
        }
      };

      const userWithPushAllowed = await this.getPushAllowedUserListFrom(data.gid, data.cid, targetUids);
      console.log(userWithPushAllowed);

      const body = {
        usersUid: userWithPushAllowed,
        payload: payload
      };

      //-----------------------------------------------//
      // send push
      //-----------------------------------------------//
      const path = `${environment.bizServerUri}/sendFCM`;

      const headers = {
        headers: new HttpHeaders({
          'authorization': this.bizFire.uid
        })
      };

      this.http.post(path, body, headers)
        .subscribe((result: any) => {
          console.log("resultresult",result);
        },(error => {
          console.error("sendPush error",error);
        }));

      return true;
    }

    private async getPushAllowedUserListFrom(gid: string, cid: string, userList: string[]){
      const promises = userList.map(async uid => {
        const snap = await this.bizFire.afStore.doc(Commons.userDataPath(gid, uid)).get().toPromise();
        let ret = uid;
        if(snap.exists){
          const userData = snap.data();
          if(userData[cid] && userData[cid]['notify'] === false){
            //console.log(`${uid} 는 제외`);
            ret = null;
          }
        }
        // userData 가 없으면,
        // 일단 PUSH는 보낸다.
        return ret;
      });

      const userWithPushAllowed = await Promise.all(promises);
      return userWithPushAllowed.filter(uid => uid != null);
    }

    private convertMessage(text: string): string {
      let ret = '';
      if(text != null){
        ret = text ? String(text).replace(/<[^>]+>/gm, '') : '';
        if(ret.indexOf('\n') !== -1){
          // replace \n
          ret = text.split('\n').join('<br>');
        }
      }
      return ret;
    }

    scrollBottom(content : Content) : boolean {
      const contentArea = content.getContentDimensions();
      // content.scrollTop == content.scrollHeight - content.contentHeight;
      const top = contentArea.scrollTop; // 스크롤 현재 top
      const height = contentArea.scrollHeight; // 내 화면에 보이지 않는 내용을 포함한 내용 높이.
      const offset = contentArea.contentHeight; // 현재 보이는 높이.

      return 150 > height - (top + offset);
    }


  findChat(cid: string): IChat| null {
    let currentChat = this.onChatRoomListChanged.getValue().find(c => c.cid === cid);
    if(currentChat == null){
      currentChat = this.squadService.onSquadListChanged.getValue().find(c => c.cid === cid);
    }
    return currentChat;
  }

  TimestampToDate(value) {
    //console.log(value, typeof value);
    if(value){
      if(typeof value === 'number'){
        // this is old date number
        return new Date(value * 1000);
      } else if(value.seconds != null &&  value.nanoseconds != null){
        const timestamp = new firebase.firestore.Timestamp(value.seconds, value.nanoseconds);
        return timestamp.toDate();
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  onNotification(name,msg) {
      Notification.requestPermission().then(() => {
          let myNotification = new Notification(name,{
          'body': msg,
          });
      })
  }

}
