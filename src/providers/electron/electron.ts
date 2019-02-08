import { Injectable } from '@angular/core';
import * as electron from 'electron';
import { BizFireService } from '../biz-fire/biz-fire';
@Injectable()
export class Electron {

  sharedObject = electron.remote.getGlobal('sharedObject');

  // electron 에서 a링크 사용하기 위한..
  ipc : any;
  onlineStatus : boolean = true;
  
  constructor(public bizFire : BizFireService,) {
    this.ipc = electron.ipcRenderer;
  }

  // 디폴트 상태창 숨기고 X버튼에 프로그램 종료이벤트 추가.
  windowClose(){
    electron.remote.getCurrentWindow().close();
  }
  windowMimimize(){
    electron.remote.getCurrentWindow().minimize();
  }
  showErrorMessages(title,message){
    electron.remote.dialog.showErrorBox(title,message);
  }

  updateOnlineStatus(){
    let k = window.navigator.onLine ? 'online' : 'offline'
    if(k == 'online'){
      console.log('온라인 상태입니다.')
      this.bizFire.setUserOnlineStatus();
    } else {
      console.log('오프라인 상태입니다.');
    }
  }

  openChatRoom(squad){
    electron.ipcRenderer.send('createChatRoom',squad);
    // 그리고 현재 디렉터리의 html을 로드합니다.
    // win.loadURL(url);
  }
}