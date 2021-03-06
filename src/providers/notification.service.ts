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
import {IAlarmConfig, IBizGroup, INotification, INotificationData, INotificationItem} from "../_models";
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

                console.log("this.notifyKey",this.notifyKey);

                // start register at first time. ONLY first time.
                if(this.notifyKey == null){
                    this.notifyKey = new FireDataKey('notify', this.bizFire.currentUID);
                }
                if(this.notifySub == null){
                    this.notificationData = [];

                    this.notifySub = this.bizFire.afStore.collection(Commons.notificationPath(this.bizFire.currentUID),
                    ref => {
                        let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
                        query = query.orderBy('created', 'asc');
                        return query;
                    }).stateChanges()
                    .pipe(takeUntil(this.bizFire.onUserSignOut))
                    .subscribe((changes : DocumentChangeAction<any>[]) => {

                        //save new value
                        changes.forEach(change => {
                            const data = change.payload.doc.data();
                            const mid = change.payload.doc.id;

                            if(change.type === 'added') {

                                // add new message to top
                                this.notificationData.unshift({mid: mid, data: data} as INotification);

                            } else if (change.type === 'modified') {

                                for(let index = 0; index < this.notificationData.length; index++) {
                                    if(this.notificationData[index].mid === mid) {
                                        this.notificationData[index] = {mid : mid, data: data} as INotification;
                                    }
                                }
                            } else if (change.type === 'removed') {

                                for(let index = 0; index < this.notificationData.length; index++) {
                                    if(this.notificationData[index].mid === mid) {

                                        // remove from array
                                        this.notificationData.splice(index,1);
                                        break;
                                    }
                                }
                            }
                        });
                        // broadcast new value.
                        this.onNotifications.next(this.notificationData);
                    })
                }

                let alarm : IAlarmConfig = user.alarm;

                if(alarm == null) {

                    alarm = {
                        groupInvite: true,
                        post: true,
                        bbs: true
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
        if(msg.html.link[0] !== 'invite') {
          await this.bizFire.setReadNotify(msg);
        }

        await this.makeWebJumpNotify(token,msg.html.link[0],msg.html.link[1],msg.html.link[2]);

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

    makeHtml(notification: INotification) : Observable<INotificationItem>{

        const data = notification.data;
        if (data.groupInvite === true) {

            return this.makeHtmlInvite(notification);

        } else if(data.post === true || data.bbs === true || data.video === true){

            return this.makeHtmlPost(notification);

        } else if(data.groupInOut === true){

            return this.makeHtmlInOutNotify(notification);

        }

    }

    private makeHtmlInvite(notification: INotification): Observable<INotificationItem>{

        return new Observable<INotificationItem>( resolve => {

            const data = notification.data;
            // get user info
            const userObserver = this.cacheService.userGetObserver(data.from);
            // get group info
            const groupObserver = this.cacheService.getObserver(Commons.groupPath(data.gid));
            const info = data.info;

            // convert
            const item: INotificationItem = notification;
            item.html = { header: null, content: null, link: null, user:null,groupColor: null };

            // to where?
            if (info.type === 'group') {
                // 누가 어느 그룹에
                zip(userObserver, groupObserver)
                .subscribe(([u, g]) => {

                  let team_name;
                  let userName;
                  if(u != null ){
                    userName = u.data['displayName'] || u.data['email'];
                    item.html.user = u;
                  } else {
                    userName = `deleted user`;
                  }
                  if( g != null){
                    team_name = g['team_name'];
                    item.html.groupColor = g['team_color'];
                  } else {
                    team_name = `deleted BizGroup`;
                  }

                  // set content
                  item.html.header = ['[invite]',`${userName}`,`${team_name}`];
                  item.html.content = [`Invitation to ${team_name}`];
                  item.html.link = ['invite',data.gid];
                  // item.html.link = [`${this.webUrl}${this.customToken}&url=home/${data.gid}`];

                  resolve.next(item);
                });
            }
        });

    }

    private makeHtmlPost(notification: INotification): Observable<INotificationItem>{

        return new Observable<INotificationItem>( resolve => {

            const data = notification.data;
            // get user info
            const userObserver = this.cacheService.userGetObserver(data.from);
            // get group info
            const groupObserver = this.cacheService.getObserver(Commons.groupPath(data.gid));
            const info = data.info;
            const gid = data.gid;

            // convert
            const item: INotificationItem = notification;
            item.html = { header: null, content: null, link: null, user: null,groupColor: null};

            if (data.post === true) {

              // get squad info
              const squadObserver = this.cacheService.getObserver(Commons.squadDocPath(gid, info.sid));

              zip(userObserver, groupObserver, squadObserver)
                  .subscribe(([u, g, s]) => {

                    let team_name;
                    let userName;
                    if(u != null ){
                      userName = u.data['displayName'] || u.data['email'];
                      item.html.user = u;
                    } else {
                      userName = `deleted user`;
                    }
                    if( g != null){
                      team_name = g['team_name'];
                      item.html.groupColor = g['team_color'];
                    } else {
                      team_name = `deleted BizGroup`;
                    }

                    // set content
                    item.html.header = ['[post]',`${userName}`, `${info.title}`];
                    item.html.content = [`${info.title}`];
                    item.html.link = ['post',data.gid,info.sid];
                    // item.html.link = [`${this.webUrl}${this.customToken}&url=squad/${data.gid}/${info.sid}/post`];

                    resolve.next(item);

                  });
            }

            // is a bbs post ?
            else if (data.bbs === true) {

                zip(userObserver, groupObserver)
                    .subscribe(([u, g]) => {

                    const title = info.title || '';
                    let userName;

                    if(u != null ){
                      userName = u.data['displayName'] || u.data['email'];
                      item.html.user = u;
                    } else {
                      userName = `deleted user`;
                    }

                    if( g != null){
                      item.html.groupColor = g['team_color'];
                    }

                    // set content
                    item.html.header = ['[notice]',`${userName}`, `${title}`];
                    item.html.content = [`${userName} 씨가 새 게시글 등록했다. 보려면 밑에 링크를 클릭하라.`];
                    item.html.link = ['bbs',data.gid,data.info.mid];
                    // second array is a routerLink !
                    // item.html.link = [`${this.webUrl}${this.customToken}&url=bbs/${data.gid}/${data.info.mid}/read`];

                    resolve.next(item);

                    });
            }

            else if (data.video === true) {
              zip(userObserver, groupObserver)
                .subscribe(([u, g]) => {

                  const title = info.message.data.title || '';
                  let userName;

                  if(u != null ){
                    userName = u.data['displayName'] || u.data['email'];
                    item.html.user = u;
                  } else {
                    userName = `<span class="text-danger">deleted user</span>`;
                  }

                  if( g != null){
                    item.html.groupColor = g['team_color'];
                  }

                  // set content
                  item.html.header = [`[video]`,`${userName}`,`${title}`];
                  item.html.content = [`${userName}님께서 화상채팅을 시작하였습니다.<br>아래 링크를 클릭하면 화상채팅에 참여할 수 있습니다.`];

                  // second array is a routerLink !
                  item.html.link = ['video',data.gid,data.info.vid];


                  resolve.next(item);

                });
            }

        });

    }

    private makeHtmlInOutNotify(notification: INotification): Observable<INotificationItem>{

        return new Observable<INotificationItem>( resolve => {

            const data = notification.data;
            // get user info
            const userObserver = this.cacheService.userGetObserver(data.from);
            // get group info
            const groupObserver = this.cacheService.getObserver(Commons.groupPath(data.gid));

            // convert
            const item: INotificationItem = notification;
            item.html = { header: null, content: null, link: null,user : null,groupColor : null};


            zip(userObserver, groupObserver)
                .subscribe(([u, g])=>{

                  let team_name;
                  let userName;
                  let type;
                  if(u != null ){
                    userName = u.data['displayName'] || u.data['email'];
                    item.html.user = u;
                  } else {
                    userName = `deleted user`;
                  }
                  if( g != null){
                    team_name = g['team_name'];
                    item.html.groupColor = g['team_color'];
                  } else {
                    team_name = `deleted BizGroup`;
                  }

                  // user joined a group.
                  item.html.header = ['[InOut]',`${userName}`, `${team_name} - ${userName}`];
                  item.html.content = [`${userName} joined BizGroup ${team_name}`];
                  item.html.link = ['inOut',data.gid];
                  // item.html.link = [`${this.webUrl}${this.customToken}&url=home/${data.gid}`];

                  resolve.next(item);

                  });

        });

    }

    acceptInvitation(notificationData: INotificationData): Promise<any> {


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
              const membersId = Object.keys(data.members).filter(uid=> uid !== this.bizFire.currentUID && data.members[uid] === true);

              const notifyData = this.buildData();

              notifyData.gid = notificationData.gid;
              notifyData.groupInOut = true;
              notifyData.info.join = this.bizFire.currentUID;
              notifyData.info.auth = notificationData.info.auth;

              this.sendTo(membersId, notifyData);

              resolve(true);

            });
        });
    }


    buildData():INotificationData {

        if(this.bizFire.currentUserValue == null){
          throw new Error('어라라. 로그인안한건가?');
        }

        const data = {

          groupInvite: false,
          bbs: false,
          post: false,

          gid: null,

          to: null,

          from: this.bizFire.currentUID,
          created: null, // biz-server set date.
          info: {},
          statusInfo:{ done: false }

        } as INotificationData;
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
