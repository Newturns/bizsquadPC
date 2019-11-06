import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, zip, Subscription, Observable } from 'rxjs';
import { BizFireService, } from './biz-fire/biz-fire';
import { IFireDataKey, IFireMessage } from '../classes/fire-model';
import { FireData } from '../classes/fire-data';
import { FireDataKey } from '../classes/fire-data-key';
import { takeUntil, take } from 'rxjs/operators';
import { Commons, STRINGS } from '../biz-common/commons';
import { DataCache } from '../classes/cache-data';
import { TokenProvider } from './token/token';
import { Electron } from './electron/electron';
import { DocumentChangeAction } from '@angular/fire/firestore';
import { CacheService } from './cache/cache';
import {environment} from "../environments/environments";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {
  IAlarmConfig,
  IBizGroup,
  INotification,
  INotificationData,
  INotificationItem,
  NotificationInfo,
  NotificationType
} from "../_models";
import {Token} from "@angular/compiler";
import {LoadingProvider} from "./loading/loading";


export interface IAlarm {
    all: boolean,
    groupInvite: boolean,
    squadInvite: boolean,
    squadInOut:boolean,
    post: boolean,
    comment:boolean,
    schedule:boolean,
    bbs:boolean
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    webUrl = 'https://product.bizsquad.net/auth?token=';

    // for notice component.
    onNotifications = new BehaviorSubject<INotification[]>(null);

    // alarm send by SettingComponent
    onAlarmChanged = new BehaviorSubject<IAlarmConfig>(null);

    // 알람 리스트
    private notificationData: INotification[];

    private notifySub: Subscription;

    /*
    * 데이터 일부만 실시간 경신하기 위해 FireData를 사용한다.
    * */
    private fireData = new FireData();
    private notifyKey: IFireDataKey;

    public ipc: any;

    customToken: any;

    notificationItems: INotificationItem[];

    constructor(
        private bizFire: BizFireService,
        private tokenService : TokenProvider,
        private cacheService : CacheService,
        private http: HttpClient,
        private loading: LoadingProvider,
        public electron: Electron,
        ) {
            this.ipc = this.electron.ipc;

            // delete all notifications
            this.bizFire.onUserSignOut.subscribe(()=>{

                this.notifyKey = null;
                //this.onUnfinishedNotices.next([]);
                this.onNotifications.next(null);
                // clear cache.
                this.fireData.clear();

                if(this.notifySub){
                    this.notifySub.unsubscribe();
                    this.notifySub = null;
                }

            });

            // allTime alarm monitor.
            this.bizFire.currentUser.subscribe(user => {

              // start new alarm ONLY first time.
              if(this.notifySub == null){
                // empty array
                this.notificationItems = [];

                this.notifySub = this.bizFire.afStore.collection(Commons.notificationPath(this.bizFire.uid),
                  ref => ref.orderBy('created', 'asc'))
                  .stateChanges()
                  .pipe(
                    takeUntil(this.bizFire.onUserSignOut),
                  )
                  .subscribe(async (changes:DocumentChangeAction<any>[]) => {

                    // save new value
                    changes.forEach( (change: DocumentChangeAction<any>) => {

                      Commons.processChange(change, this.notificationItems, 'mid', (c: any)=>{
                        const item = {mid: c.payload.doc.id, data: c.payload.doc.data(), ref: c.payload.doc.ref} as INotification;
                        //----------- 호환성 유지 -----------------//
                        if(item.data.type == null){
                          if(item.data.bbs === true){
                            item.data.type = 'bbs';
                          }
                          if(item.data.post === true){
                            item.data.type = 'post';
                          }
                          if(item.data.groupInvite === true){
                            item.data.type = 'groupInvite';
                          }
                          if(item.data.video === true){
                            item.data.type = 'video';
                          }
                          if(item.data.comment === true){
                            item.data.type = 'comment';
                          }
                        }
                        //----------- 호환성 유지 -----------------//
                        return item;
                      }, null, false);

                    });// end of forEach

                    // filter 'comment' and 'chat'.
                    this.onNotifications.next(this.notificationItems);

                  });

              }

              // find alarm from /user/<>.alarm
              let alarm: IAlarmConfig = user.alarm;

              if(alarm == null){
                // set to default
                /*
                * 디폴트는 그룹 초대 메시지, 채팅 알람.
                * */
                alarm = {
                  post: true,
                  bbs: true,
                  comment: true,
                  groupInvite: true,
                  version: this.bizFire.buildNo
                };

                // and update firebase
                this.updateAlarmStatus(alarm);

              } else {
                // alarm info changed.
                this.onAlarmChanged.next(alarm);
              }

            });
    }

    updateAlarmStatus(alarm: IAlarmConfig) {
        return this.bizFire.afStore.doc(Commons.userPath(this.bizFire.currentUID)).update({
          alarm: alarm
        });
    }

    // Click alarm text. 아직 안씀 보류
    async onClickNotifyContents(msg: INotificationItem) {

      this.loading.show();
      try {

        const token = await this.tokenService.getToken(this.bizFire.uid);

        //invite 알림은 업데이트없이 바로삭제.
        // if(msg.html.link[0] !== 'invite') {
        //   await this.bizFire.setReadNotify(msg);
        // }
        //
        // await this.makeWebJumpNotify(token,msg.html.link[0],msg.html.link[1],msg.html.link[2]);

        this.loading.hide();

      } catch (e) {
        this.loading.hide();
      }
      // this.tokenService.getToken(this.bizFire.uid).then((token : string) => {
      //   // 알람 스테이터스 true로 변경.
      //   this.bizFire.setReadNotify(msg).then(() => {
      //     console.log(msg);
      //     // 웹 링크로 이동. 0 : type , 1 : gid , 2 : 필요한 id - sid,mid 등
      //     this.makeWebJumpNotify(msg.html.link[0],msg.html.link[1],msg.html.link[2]);
      //   })
      // });
    }

    async makeWebJumpNotify(token: string,type: string, gid?: string, id?: string) {
        if(type === 'invite' || type === 'inOut') {
          this.ipc.send('loadGH',`${environment.webJumpBaseUrl}${token}&url=home/${gid}`)
          // item.html.link = [`${this.webUrl}${this.customToken}&url=home/${data.gid}`];
          // item.html.link = [`${this.webUrl}${this.customToken}&url=home/${data.gid}`];
        }
        if(type === 'post') {
          this.ipc.send('loadGH',`${environment.webJumpBaseUrl}${token}&url=squad/${gid}/${id}/post`)
          // item.html.link = [`${this.webUrl}${this.customToken}&url=squad/${data.gid}/${info.sid}/post`];
        }
        if(type === 'bbs') {
          this.ipc.send('loadGH',`${environment.webJumpBaseUrl}${token}&url=bbs/${gid}/${id}/read`)
          // item.html.link = [`${this.webUrl}${this.customToken}&url=bbs/${data.gid}/${data.info.mid}/read`];
        }
        if(type === 'video') {
          this.ipc.send('loadGH',`${environment.webJumpBaseUrl}${token}&url=video/${id}`)
          // item.html.link = [`${this.webUrl}${this.customToken}&url=bbs/${data.gid}/${data.info.mid}/read`];
        }
    }

  acceptInvitation(notificationData: INotificationData): Promise<any> {

    console.log('acceptInvitation.', notificationData);

    return new Promise<any>( resolve => {
      // get type
      let path;
      if(notificationData.info.type !== 'squad'){
        // this is a group invitation
        path = Commons.groupPath(notificationData.gid);

      } else if(notificationData.info.type === 'squad'){
        // squad
        path = Commons.squadDocPath(notificationData.gid, notificationData.info.sid);
      }

      // get group data
      this.cacheService.groupValueObserver(notificationData.gid)
        .pipe(take(1))
        .subscribe((g: IBizGroup)=>{

          const data = g.data;

          // set me
          data.members[this.bizFire.currentUID] = true;

          // is ths user a manager?
          if(notificationData.info.auth === STRINGS.FIELD.MANAGER){
            // yes.
            // add to partner
            data[STRINGS.FIELD.MANAGER][this.bizFire.currentUID] = true;
          }

          // is ths user a partner?
          if(notificationData.info.auth === STRINGS.FIELD.PARTNER){
            // yes.
            // add to partner
            data[STRINGS.FIELD.PARTNER][this.bizFire.currentUID] = true;
          }

          // update group member
          this.bizFire.afStore.doc(path).update(data);

          // send someone joined alarm
          const membersId = Object.keys(data.members).filter(uid=> uid !== this.bizFire.uid && data.members[uid] === true);

          const notifyData = this.buildData('groupInvite');

          notifyData.gid = notificationData.gid;
          notifyData.info.auth = notificationData.info.auth;

          this.sendTo(membersId, notifyData);

          resolve(true);

        });

    });
  }



  buildData(type: NotificationType, info?: NotificationInfo, sid?: string): INotificationData {

    const data = {
      type: type,
      gid: this.bizFire.currentBizGroup.gid,
      to: null,
      from: this.bizFire.uid,
      created: null, // biz-server will set date here.
      info: info || {} as NotificationInfo,
      statusInfo:{ done: false }
    } as INotificationData;

    // set data.bbs = true if type is 'type'.
    data[type] = true;

    // set sid if it exists.
    if(sid){
      data.sid = sid;
    }

    return data;
  }

    async sendTo(uids: string[], notificationConfig: INotificationData) {

      //console.log('sentTo', uids, notificationConfig);

      try {
        const works = uids.map(async uid => {

          console.log('adding notify ', Commons.notificationPath(uid), notificationConfig);

          notificationConfig.to = uid;

          return this.postNotificationToServer(notificationConfig);
        });

        const results = works.map(async w => {
          return await w;
        });

        return results;

      } catch (e) {
        console.error(e);
        throw e;
      }

    }

  private postNotificationToServer(notifyData: INotificationData) {

      return new Promise( resolve => {

        if(this.bizFire.currentBizGroup == null){
          throw new Error('this.bizFire.currentBizGroup is null. Cannot send notification');
        }

        //** notifyData must have 'to' field.
        if(notifyData.to == null){
          throw new Error('to field must be set.');
        }

        if(notifyData.version == null){
          notifyData.version = this.bizFire.buildNo;
        }

        let bizserverUrl = environment.bizServerUri;
        //bizserverUrl = 'http://localhost:9010';

        const headers = {
          headers: new HttpHeaders({
            'authorization': this.bizFire.currentUID
          })
        };

        const notifyUri = `${bizserverUrl}/v1/notification`;
        this.http.post(notifyUri, {notification: notifyData}, headers)
          .subscribe((result: any) => {

            console.log(result);

            resolve(result);

            if(result.ok){

            } else {

            }

          });
      });
  }

  deleteNotification(msg: INotification){
    return this.bizFire.afStore.collection(Commons.notificationPath(this.bizFire.currentUID)).doc(msg.mid)
      .delete();
  }


}
