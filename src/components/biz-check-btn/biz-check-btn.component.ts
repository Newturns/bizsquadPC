import {Component, Input, OnInit} from '@angular/core';
import {BizFireService} from "../../providers";

@Component({
  selector: 'biz-check-btn',
  templateUrl: './biz-check-btn.component.html',
})
export class BizCheckBtnComponent implements OnInit {

  @Input()
  checked : boolean;

  groupColor : string = '#324CA8';

  @Input()
  useGroupColor: boolean = true;

  constructor(private bizFire : BizFireService) { }

  ngOnInit() {
    if(this.bizFire.currentBizGroup) {
      if(this.bizFire.currentBizGroup.data.team_color) {
        if(this.useGroupColor)
        this.groupColor = this.bizFire.currentBizGroup.data.team_color;
      }
    }
  }

}
