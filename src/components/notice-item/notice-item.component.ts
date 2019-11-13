import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {IBizGroup, IBizGroupData, INotification} from "../../_models";
import {BizFireService} from "../../providers";
import {CacheService} from "../../providers/cache/cache";
import {NEWCOLORS} from "../../biz-common/colors";
import {Commons} from "../../biz-common/commons";
import {BizComponent} from "../../classes/biz-component";
import {ISquadData} from "../../providers/squad.service";
import {TokenProvider} from "../../providers/token/token";

@Component({
  selector: 'biz-notice-item',
  templateUrl: './notice-item.component.html',
})

export class NoticeItemComponent extends BizComponent implements OnInit {


  get item(): INotification {
    return this._item;
  }

  @Input()
  set item(value: INotification) {
    this._item = value;
    this.makeLink(value); // fire link$ with link string.
  }

  private _item: INotification;

  done = false;

  link$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  @Output()
  onAccept = new EventEmitter<INotification>();

  private linkUrl: string[] = [];
  private linkParam;

  private pcLinkUrl : string;

  // 세로 실선 배경색.
  subColor = '#2a8bf2';
  group: IBizGroup;

  constructor(private bizFire: BizFireService,
              private tokenService : TokenProvider,
              private cacheService: CacheService) {
    super();
    this.loadLang(bizFire);

  }

  ngOnInit() {

    this.done = this.item.data.statusInfo.done;

    this.bizFire.onBizGroupSelected
      .pipe(this.takeUntil)
      .subscribe((g: IBizGroup)=>{
        this.group = g;
        this.subColor = this.group.data.team_subColor || NEWCOLORS.duskblue.sub;
      });
  }

  getUserObserver(uid: string){
    return this.cacheService.userGetObserver(uid);
  }

  getGroupObserver(gid: string): Promise<IBizGroupData> {
    return new Promise<IBizGroupData>(resolve => {
      this.cacheService.getObserver(Commons.groupPath(gid)).pipe(take(1)).subscribe(data => resolve(data));
    });
  }


  onLinkClicked(item: INotification){

    // console.log(item, this.linkUrl, this.linkParam);

    if(this.linkUrl.length > 0){

      this.tokenService.notifyWebJump(item,this.pcLinkUrl);

    }
  }

  private async makeLink(item: INotification) {

    const groupData = await this.getGroupObserver(item.data.gid);
    let link = groupData.team_name;

    // add gid
    this.linkUrl.push(item.data.gid);

    this.pcLinkUrl = item.data.gid;

    // is it bbs ?
    if(item.data.type === 'bbs'){

      link += `/${this.langPack['BBS']}`;
      this.linkUrl.push('notice');
      this.pcLinkUrl += '/notice';

    }

    //is it invite?
    if(item.data.type === 'groupInvite'){
      // ??

      return ;
    }

    // is it video ?
    if(item.data.type === 'video'){
      // ??
      link = `video`;
      this.linkUrl = [];
      this.linkUrl.push('video');
      this.pcLinkUrl += '/notice';

      if(item.data.info.vid){
        link += `/${item.data.info.vid}`;
        this.linkUrl.push(item.data.info.vid);
        this.pcLinkUrl += `/${item.data.info.vid}`;
      }

    }

    if(item.data.type === 'post' || item.data.type === 'comment'){

      // is it post or comment?
      if(item.data.sid != null || item.data.info && item.data.info.sid != null){
        // add squad name
        const sid = item.data.sid || item.data.info.sid;
        const squadName: ISquadData = await this.cacheService.getPromise(Commons.squadDocPath(item.data.gid, sid));
        if(squadName){
          link += `/${squadName.name || squadName.title}`;
          // add squad
          this.linkUrl.push('squad');
          this.linkUrl.push(sid);

          this.pcLinkUrl += `/squad/${sid}`;

          // add comment id?
          if(item.data.type === 'comment' && item.data.info.cid){
            if(this.linkParam == null){
              this.linkParam = {};
            }
            this.linkParam['cid'] = item.data.info.cid;
          }
        }
      }
    }


    this.link$.next(link);

  }


  onDelete(){
    if(this.item.ref){
      this.item.ref.delete();
    }
  }


  onAvatarClick(e: Event){
    e.stopPropagation();

    console.log(this.item);

    // staus 를 done으로 수정.
    /*if(this.item.data.statusInfo.done !== true){
      this.item.ref.update({
        statusInfo: {
          done: true
        }
      });
    }*/

    // todo: 알람 done 토글
    // 이건 임시 코드.
    // 버튼을 누를때마다 done 값을 전환한다.
    // 사양 확정후 위의 주석 코드로 바꿀것.
    this.item.ref.update({
      statusInfo: {
        done: !this.item.data.statusInfo.done
      }
    });
  }

  onAcceptClicked(){
    this.onAccept.emit(this.item);
  }

  fromWhere(type:'post' | 'bbs' | 'comment' | 'schedule' | 'video'| 'groupInvite'){
    if(type === 'post'){
      return 'posted';
    } else if (type === 'bbs'){
      return 'notice'
    } else if (type === 'comment'){
      return 'comment'
    } else if (type === 'schedule'){
      return 'schedule'
    } else if (type === 'video'){
      return 'video'
    } else if (type === 'groupInvite'){
      return 'invited'
    } else {
      return '';
    }
  }
}
