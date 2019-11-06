import {Component, Input, OnInit} from '@angular/core';
import {TakeUntil} from "../../biz-common/take-until";
import {COLORS} from "../../biz-common/colors";
import {CacheService} from "../../providers/cache/cache";
import {Commons} from "../../biz-common/commons";
import {IBizGroupData} from "../../_models";
import {ISquadData} from "../../providers/squad.service";

@Component({
  selector: 'biz-team-icon',
  templateUrl: './team-icon.component.html',
})
export class TeamIconComponent extends TakeUntil implements OnInit {

  @Input()
  teamData: any;

  @Input()
  size: 32 | 40 | 64 | 80 = 64;

  private _gid: string;
  private _sid: string;


  get gid(): string {
    return this._gid;
  }

  @Input()
  set gid(value: string) {
    this._gid = value;
    this.load();
  }

  get sid(): string {
    return this._sid;
  }

  @Input()
  set sid(value: string) {
    this._sid = value;
    this.load();
  }

  public defaultColor : string = COLORS.default;

  constructor(private cacheService: CacheService) {
    super();
  }

  ngOnInit() {

  }

  private load() {

    if(this.teamData) {
      //팀 데이터를 input으로 받았을 때.
      console.log("teamData :: ",this.teamData);
    } else {
      if(this.gid && this.sid === null) {
        this.cacheService.getObserver(Commons.groupPath(this.gid))
          .pipe(this.takeUntil)
          .subscribe(data => this.teamData = data as IBizGroupData);

      } else if(this.gid && this.sid) {
        this.cacheService.getObserver(Commons.squadDocPath(this.gid,this.sid))
          .pipe(this.takeUntil)
          .subscribe(data => this.teamData = data as ISquadData);
      }
    }
  }

}
