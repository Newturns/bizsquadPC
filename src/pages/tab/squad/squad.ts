import { Electron } from './../../../providers/electron/electron';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { IBizGroup, BizFireService } from '../../../providers/biz-fire/biz-fire';
import { ISquad, SquadService } from '../../../providers/squad.service';
import { IFolderItem } from '../../../_models/message';
import { filter, takeUntil, map } from 'rxjs/operators';
import { STRINGS } from '../../../biz-common/commons';

@IonicPage({  
  name: 'page-squad',
  segment: 'squad',
  priority: 'high'
})
@Component({
  selector: 'page-squad',
  templateUrl: 'squad.html',
})
export class SquadPage {

  private _unsubscribeAll;

  currentSquad: ISquad;
  currentBizGroup: IBizGroup;

  ipc: any;

  isPartner = false;

  folders: Array<IFolderItem> = [];
  privateFolders: Array<IFolderItem> = [];
  publicSquads: ISquad[] = [];
  privateSquads: ISquad[] = [];
 
  public_shownGroup = null;
  private_shownGroup = null;

  private userDataChanged = new Subject<any>() ; // userData monitor.
  private userDataMargin: Subscription;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public bizFire : BizFireService,
    public electron : Electron,
    private squadService: SquadService,) {
    this._unsubscribeAll = new Subject<any>();
    this.ipc = electron.ipc;
  }

  ngOnInit() {

    this.bizFire.onBizGroupSelected
    .pipe(filter(g=>g!=null), takeUntil(this._unsubscribeAll))
    .subscribe(group => {
        // if current group changed,
        // select my squad.
        if( this.currentBizGroup != null) {
            if( this.currentBizGroup.gid !== group.gid){
                this.currentBizGroup = group;
                // get ne userDataChanged monitor
                this.isPartner = this.bizFire.isPartner(group);
                this.startMonitorUserData(group);
                
                // set MySquad
                // this.squadService.onSelectSquad.next({sid: STRINGS.MY_SQUAD_STRING, data: null});
            } else {
                // just copy latest value.
                this.isPartner = this.bizFire.isPartner(group);
                this.currentBizGroup = group;
            }
        } else {
            // never started.
            this.currentBizGroup = group;
            // get ne userDataChanged monitor
            this.isPartner = this.bizFire.isPartner(group);
            this.startMonitorUserData(group);
            // set MySquad
            // this.squadService.onSelectSquad.next({sid: STRINGS.MY_SQUAD_STRING, data: null});
        }
    });


    combineLatest(this.userDataChanged, this.squadService.onSquadListChanged)
    .pipe(
        takeUntil(this._unsubscribeAll))
    .subscribe(([userData, squadList]) => {
        if(userData.gid === this.currentBizGroup.gid){
            this.updateShelf(userData, squadList);
        }
    });
  }

  private startMonitorUserData(group: IBizGroup) {
    console.log('group chagned to', group.gid);
    // biz group have changed.
    if(this.userDataMargin){
        this.userDataMargin.unsubscribe();
    }
    // * start monitor userData
    const path = `${STRINGS.STRING_BIZGROUPS}/${group.gid}/userData/${this.bizFire.currentUID}`;
    this.userDataMargin = this.bizFire.afStore.doc(path).valueChanges()
        .pipe(
            map(userData => ({gid: group.gid, uid: this.bizFire.currentUID, data: userData})),
            takeUntil(this.bizFire.onUserSignOut))
        .subscribe(userData => this.userDataChanged.next(userData));
  }

  // * load left folders.
  /*
  * 실제 존재하는 폴더를 위주로
  * 사이드바에 표시해 리얼타임 갱신이 가능하게 한다.
  * */
  private updateShelf(userData: any, originalSquadList: ISquad[]) {
    //console.log('updateShelf with userData', userData, originalSquadList);
    // clear old ones.
    console.log("originalsquadlist",originalSquadList);
    this.folders = []; // my folders
    this.privateSquads = [];
    this.publicSquads = [];

    const {folders, privateFolders, privateSquads, publicSquads} = SquadService.makeSquadMenuWith(userData.data, originalSquadList);

    // console.log(folders, privateSquads, publicSquads);

    this.folders = folders;
    this.privateSquads = privateSquads;
    this.publicSquads = publicSquads;
    this.privateFolders = privateFolders;
  }

  toggleGroup(group) {
    if (this.isGroupShown(group)) {
        this.public_shownGroup = null;
    } else {
        this.public_shownGroup = group;
    }
  };
  isGroupShown(group) {
      return this.public_shownGroup === group;
  };
  togglePrivateGroup(group) {
    if (this.isPrivateGroupShown(group)) {
        this.private_shownGroup = null;
    } else {
        this.private_shownGroup = group;
    }
  };
  isPrivateGroupShown(group) {
      return this.private_shownGroup === group;
  };

  onSquadChat(ev,squad) {
    ev.stopPropagation();
    console.log(squad);
    this.electron.openChatRoom(squad);
  }

  ngOnDestroy(): void {
    this.currentBizGroup = null;

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    if(this.userDataMargin){
        this.userDataMargin.unsubscribe();
        this.userDataChanged = null;
    }
  }
  kimtaehwan(squad){
      console.log(squad);
  }

}