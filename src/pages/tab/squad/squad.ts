import { GroupColorProvider } from './../../../providers/group-color';
import { Electron } from './../../../providers/electron/electron';
import {Component, EventEmitter, Output} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import {Subject, Subscription, combineLatest, BehaviorSubject} from 'rxjs';
import { BizFireService } from '../../../providers/biz-fire/biz-fire';
import { ISquad, SquadService } from '../../../providers/squad.service';
import { filter, takeUntil, map } from 'rxjs/operators';
import {Commons, STRINGS} from '../../../biz-common/commons';
import { TokenProvider } from '../../../providers/token/token';
import {LangService} from "../../../providers/lang-service";
import {IBizGroup, IFolderItem} from "../../../_models";
import {IChat} from "../../../_models/message";

export interface ISquadListData {
  generalSquads?: ISquad[];
  agileSquads?: ISquad[];
  partnerSquads?: ISquad[];
  bookmark?: ISquad[];
}


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

  currentBizGroup: IBizGroup;

  ipc: any;

  isPartner = false;

  userCustomData: any;

  isAndroid: boolean = false;


  private userDataChanged = new Subject<any>(); // userData monitor.
  private userDataMargin: Subscription;


  public squadfilterValue : string;

  // ngFor filtered array
  filteredGeneralSquads: IChat[];
  filteredAgileSquads: IChat[];
  filteredBookmark: IChat[];

  //아직 안씀
  folders: Array<IFolderItem> = [];

  langPack : any;

  webUrl = 'https://product.bizsquad.net/auth?token=';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bizFire : BizFireService,
    public electron : Electron,
    private squadService: SquadService,
    public platform : Platform,
    private tokenService : TokenProvider,
    private langService: LangService,
    public groupColorProvider : GroupColorProvider) {
    this._unsubscribeAll = new Subject<any>();
    this.ipc = electron.ipc;

    this.isAndroid = platform.is('ios');

    this.langService.onLangMap
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((l: any) => {
        this.langPack = l;
    });
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
            this.filterBroadCast(userData, squadList);
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
        .subscribe(userData => {
          this.userCustomData = userData;
          this.userDataChanged.next(userData);
        });
  }

  private filterBroadCast(userData: any,squadList: IChat[]) {
    // create broad cast data

    this.filteredGeneralSquads = squadList.filter(s => s.data.general === true && this.isFavoriteSquad(userData,s.sid) === false);
    this.filteredAgileSquads = squadList.filter(s => s.data.agile === true && this.isFavoriteSquad(userData,s.sid) === false);
    this.filteredBookmark = squadList.filter(s => this.isFavoriteSquad(userData,s.sid) === true);
  }


  onSquadChat(ev,squad : IChat) {
    ev.stopPropagation();
    const cutRefValue = {cid: squad.cid, data: squad.data};
    console.log(squad);
    this.electron.openChatRoom(cutRefValue);
  }

  private filterText(squad: ISquad, searchText: string | null): boolean {
    let textIncluded = true;
    if(searchText){
      searchText = searchText.toLowerCase();
      textIncluded = squad.data.name.toLowerCase().indexOf(searchText) !== -1;
      if(!textIncluded){
        textIncluded = squad.data.type.toLowerCase().indexOf(searchText) !== -1;
      }
    }
    return textIncluded;
  }

  isFavoriteSquad(userData: any, sid: string): boolean {
    let ret = false;
    if(userData){
      ret = userData[sid] && userData[sid]['bookmark'] === true;
    }
    return  ret;
  }

  // renwal new code
  onSquadTypeFilter(type: string) {
    this.squadfilterValue = type;
    console.log(type);
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

}
