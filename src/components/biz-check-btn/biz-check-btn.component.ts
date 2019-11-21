import {Component, Input, OnInit} from '@angular/core';
import {BizFireService} from "../../providers";

@Component({
  selector: 'biz-check-btn',
  templateUrl: './biz-check-btn.component.html',
})
export class BizCheckBtnComponent implements OnInit {

  @Input()
  checked : boolean;

  groupCOlor : string = '#324CA8';

  constructor(private bizFire : BizFireService) { }

  ngOnInit() {
    if(this.bizFire.currentBizGroup) {
      if(this.bizFire.currentBizGroup.data.team_color) {
        this.groupCOlor = this.bizFire.currentBizGroup.data.team_color;
      }
    }
  }

}
