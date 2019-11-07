import {BehaviorSubject} from 'rxjs';
import * as firebase from 'firebase/app';
import {Injectable} from '@angular/core';
import {IChat, IMessage, Message} from "../../../_models/message";
import {BizFireService} from "../../../providers";

interface MapItemEx extends MapItem{
  unsubscribe?: any,
}

export interface MapItem {
  unreadList: IMessage[],
  cid: string,
  chat?: IChat
}

export interface IUnreadMap {
  get(cid: string): MapItem,
  totalUnreadCount(): number,
  getValues(): MapItem[]
}

class UnreadMap implements IUnreadMap{

  private map: {[cid: string]: MapItemEx};
  get(cid: string): MapItemEx {
    return this.map[cid];
  }
  getValues(): MapItem[] {
    return Object.values(this.map);
  }

  totalUnreadCount(): number {
    let count = 0;
    Object.keys(this.map).forEach(cid => {
      // console.log(cid, this.map[cid].unreadList.length);
      count += this.map[cid].unreadList.length;
    });
    return count;
  }

  constructor() {
    this.map = {};
  }

  add(cid: string, item: MapItemEx){
    if(this.map[cid] == null){
      this.map[cid] = item;
    } else {
      throw new Error(`this.map has [${cid}] already.`);
    }
  }
  unRegister(chatId){
    // remove from array
    if(this.map[chatId]){
      if(this.map[chatId].unsubscribe != null){
        this.map[chatId].unsubscribe();
        this.map[chatId] = null;
        delete this.map[chatId];
      }
    }
  }
  clear(){
    if(this.map){
      Object.keys(this.map).forEach(cid=> {
        if(this.map[cid].unsubscribe != null){
          this.map[cid].unsubscribe();
        }
      });
      this.map = {};
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class UnreadCounter {

  constructor(private bizFire: BizFireService) {
    this.unreadMap = new UnreadMap();
  }

  unreadChanged$ = new BehaviorSubject<IUnreadMap>(null);

  private readonly unreadMap: UnreadMap;

  isRegistered(cid: string): boolean {
    return this.unreadMap.get(cid) != null;
  }

  register(chatId: string, chat: IChat){

    if(this.unreadMap.get(chatId) != null){
      throw new Error('이미 등록한 채팅방의 언리드 모니터를 또하려고 시도...');
    }

    //mid: 채팅방 ID
    const newItem: MapItemEx  = {
      unsubscribe: null,
      unreadList: [],
      chat: chat,
      cid: chat.cid
    };

    newItem.unsubscribe = chat.ref.collection('chat')
      .where(new firebase.firestore.FieldPath('read', this.bizFire.uid, 'unread'), '==', true)
      .onSnapshot(snaps => {

        /*if(snaps.docs.length > 0){
          console.log(chatId, snaps.docs.length, 'unread found from chatDoc:');
        }*/
        newItem.unreadList = snaps.docs.map(snap => (new Message(snap.id, snap.data(), snap.ref)));
        this.recalculateUnreadCount();
      }, error => console.error(error));

    this.unreadMap.add(chatId, newItem);
  }


  unRegister(cid: string){
    this.unreadMap.unRegister(cid);
  }

  private recalculateUnreadCount(){
    /*
    // 모든 채팅방들 언리드 카운트를 집계해 브로드캐스트
    let map: IUnreadItem[] = [];
    console.log(this.map);

    Object.keys(this.map)
      .forEach(cid =>{
        if(this.map[cid].unreadList != null){
          const item: IUnreadItem = { cid: cid, data: []};
          item.data = this.map[cid].unreadList;
          console.log(item);
          map.push(item);
        }
      });
    //map = Object.keys(this.map).map(chatId => ({cid: chatId, data: this.map[chatId].unreadList} as IUnreadItem));

    console.log(map);

    // 이상하게...map.push 가 자꾸 동일 cid로 덮어써짐...

     */

    // unreadChanged$ means somthing changed.
    this.unreadChanged$.next(this.unreadMap);
  }

  clear(){
    if(this.unreadMap){
      this.unreadMap.clear();
    }
    if(this.unreadChanged$.getValue() != null){
      this.unreadChanged$.next(null);
    }
  }
}
