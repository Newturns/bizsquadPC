import { Electron } from './../../providers/electron/electron';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { LoadingProvider,BizFireService } from './../../providers';
import {Subject, timer} from 'rxjs';
import { takeUntil,take } from 'rxjs/operators';
import * as electron from 'electron';
import {IChat} from "../../_models/message";
import {IUserData} from "../../_models";
import {UserStatusProvider} from "../../providers/user-status";

import * as firebase from 'firebase';
import {environment} from "../../environments/environments";
import * as angularFire from '@angular/fire';
import {AngularFireDatabase} from "@angular/fire/database";

@IonicPage({
  name: 'page-login',
  segment: 'login',
  priority: 'high'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage implements OnInit {

  rememberId : boolean = false;
  loginForm: FormGroup;
  version: any;
  hideForm = false;

  userEmail = '';
  userPwd : any;

  // 새 창으로 열기위해..
  ipc: any;

  // 구독 종료
  private _unsubscribeAll;

  autoLoign : boolean = false;

  private emailValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.email
  ]);
  private passwordValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.minLength(6)
  ]);

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electron: Electron,
    private bizFire: BizFireService,
    private loading: LoadingProvider,
    public formBuilder: FormBuilder,
    private userStatusService: UserStatusProvider,
    private angularFIreDB : AngularFireDatabase,
    ) {
      this.loginForm = formBuilder.group({
        email: ['', this.emailValidator],
        password: ['', this.passwordValidator]
      });
      this.ipc = electron.ipc;
      this._unsubscribeAll = new Subject<any>();
  }
  ionViewCanEnter(){
    this.hideForm = true;
    electron.ipcRenderer.send('giveMeRoomValue', 'ping');
    electron.ipcRenderer.send('getLocalUser', 'ping');
    electron.ipcRenderer.on('selectRoom', (event, roomData : IChat) => {
      if(roomData != null) {
        this.hideForm = false;
        this.loading.show();
        this.navCtrl.setRoot('page-chat-frame',{roomData : roomData});
        this.loading.hide();
      } else {
        this.hideForm = true;
      }
    })
  }

  ngOnInit() {

    electron.ipcRenderer.on('sendUserData',(e, data) => {
      console.log("datadatadatadatadata:::",data);
      this.userEmail = data.id;
      this.userPwd = data.pwd;
      this.autoLoign = data.auto;

      // if(this.autoLoign) {
      //   timer(1000).subscribe(() => {
      //     if(this.loginForm.valid) this.onLogin();
      //   });
      // }
    });

    // 버전 가져오기
    this.version = electron.remote.app.getVersion();

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async onLogin() {

    if(this.loginForm.valid) {

      this.loading.show();

      try {
        const email = this.loginForm.value['email'];
        const password = this.loginForm.value['password'];

        if(this.bizFire.afAuth.auth.currentUser != null) {
          await this.bizFire.signOut();
        }

        await this.bizFire.loginWithEmail(email,password);

        this.electron.saveLocalUser(email,password,this.autoLoign);

        this.electron.setCookieID('https://www.bizsquad.net','rememberID',this.loginForm.value['email']);

        const gid = await this.findLastBizGroup();

        if(gid && await this.bizFire.onSelectGroup(gid)) {
          // this.navCtrl.setRoot('page-group-list');
          this.navCtrl.setRoot('page-tabs');

        } else {
          this.navCtrl.setRoot('page-group-list');
        }

        this.userStatusService.onUserStatusChange();

        this.loading.hide();
      } catch (e) {

        console.log(e);
        this.loading.hide();
        this.electron.showErrorMessages("Login failed.","you entered an incorrect email address or password.");
      }
    } else {
      this.electron.showErrorMessages("Login failed.","Email format is invalid or password has 6 digits or less.");
    }

  }

  async findLastBizGroup() {
    return new Promise<string>( (resolve1, reject) => {
      this.bizFire.currentUser
        .pipe(take(1))
        .subscribe((userData: IUserData)=>{

          if(userData.lastPcGid){
            resolve1(userData.lastPcGid);
          } else {
            resolve1(null);
          }
        });
    });
  }


  changeDB() {

    // this.electron.localStorage.get('userData', (error, data) => {
    //
    //   if (error) throw error;
    //
    //   console.log(data);
    // });

    // this.angularFIreDB.database.app.delete().then(() => {
    //
    //   const a = firebase.initializeApp(environment.taxline).database().app.firestore().collection('user');
    //   console.log(a);
    //
    // }).catch(err => {
    //   console.log("에러발생",err)
    // });

  }



  // ------------------------------------------------------------------
  // * electron function.
  // ------------------------------------------------------------------

  gotoSignUp() {
    this.ipc.send('loadGH','http://product.bizsquad.net/signUp/step1');
  }

  onAutoLogin() {
    this.autoLoign = !this.autoLoign;
  }
  windowHide() {
    this.electron.windowHide();
  }

  windowMimimize() {
    this.electron.windowMimimize();
  }
}
