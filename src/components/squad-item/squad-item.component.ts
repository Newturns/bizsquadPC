import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TakeUntil} from "../../biz-common/take-until";
import {ISquad, SquadService} from "../../providers/squad.service";
import {IBizGroup} from "../../_models";
import {BizFireService} from "../../providers";
import {COLORS} from "../../biz-common/colors";

@Component({
  selector: 'biz-squad-item',
  templateUrl: './squad-item.component.html',
})

export class SquadItemComponent extends TakeUntil implements OnInit {

  squadBox: ISquad;

  memberCount;

  @Input()
  set squad(s: ISquad){
    this.loadSquad(s);
  }

  @Input()
  star:boolean = false;

  //잠금?인지아닌
  @Input()
  lockFlg: boolean;
  //스쿼드 아이템이 선택됐을 때 css를 변경한다.



  //박스내에 자물쇠, 코멘트 등의 이벤트가 필요할 때 쓰도록 한다.
  // @Input()
  // func:[]

  group: IBizGroup;
  team_color ;


  @Output()
  clickedFunc = new EventEmitter<any>();

  squadSelected:boolean = false;

  constructor(private bizFire: BizFireService,
              private squadService: SquadService) {
    super();
  }

  ngOnInit() {
    this.bizFire.onBizGroupSelected
    .pipe(this.takeUntil)
    .subscribe((g: IBizGroup) => {
      this.group = g;
      this.team_color = g.data.team_color || COLORS.default;
    });
  }

  onOverFunc(){
    this.clickedFunc.emit(this.squadBox.sid);
  }

  private loadSquad(s: ISquad){
    if(s != null){
      this.squadBox = s;
      this.memberCount = s.isPublic() ? Object.keys(this.bizFire.currentBizGroup.data.members).length : s.getMemberCount();
    }
  }

  onFavoritesSelect(e){
    e.stopPropagation();

    this.squadService.setFavorite(this.squadBox.sid, !this.star);
  }
}
