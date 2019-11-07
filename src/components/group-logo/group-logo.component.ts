import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IBizGroup} from '../../_models';

@Component({
  selector: 'biz-group-logo',
  templateUrl: './group-logo.component.html',
})
export class GroupLogoComponent implements OnInit {

  @Input()
  group : IBizGroup;

  //이미지가 없을때 텍스트로만 표시하는 모드.(used main bar.)
  @Input()
  textMode : false;

  @Output()
  clickLogo = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {

  }

}
