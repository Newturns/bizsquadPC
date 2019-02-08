import { Electron } from './../../providers/electron/electron';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { LoadingProvider,BizFireService } from './../../providers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUserState } from '../../providers/biz-fire/biz-fire';
 
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

  autoLogin : boolean;
  loginForm: FormGroup;

  // 새 창으로 열기위해..
  ipc: any;

  // 구독 종료
  private _unsubscribeAll;

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
    public formBuilder: FormBuilder
    ) {
      this.loginForm = formBuilder.group({
        email: ['', this.emailValidator],
        password: ['', this.passwordValidator]
      });
      this.ipc = electron.ipc;
      this._unsubscribeAll = new Subject<any>();
  }

  ngOnInit() { 
    // test...중복 로그인 중...
    this.bizFire.authState
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((state: IUserState) => {
        if(state.user && state.autoSignIn){
            console.log('user already logged in, Force SignOut?',state.user.email);

            // YES
            //this.bizFire.signOut();
        }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private onLogin(): void {
    this.loading.show();
    console.log(this.loginForm.valid);
    if (!this.loginForm.valid) {
      // 폼 값이 없으면 로그인 에러창 출력
      // alert("you entered an incorrect email address or password.");
      this.loading.hide();
      this.electron.showErrorMessages("Login failed.","you entered an incorrect email address or password.");
    } else {
      // 로그인 정보 인증
        this.bizFire.loginWithEmail(this.loginForm.value['email'], this.loginForm.value['password']).then(user => {
          this.loading.hide();
          // 로그인 시 기존과 다르게 이제 비즈그룹을 선택 후 메인페이지로 이동.
          // this.navCtrl.setRoot('page-tabs').catch(error => console.error(error));
          this.bizFire.getUserOnlineStatus().then(() =>{
            this.navCtrl.setRoot('page-group-list').then().catch(error => console.error(error));
          })
        }).catch(err => {
          // 로그인 인증 실패 
          this.loading.hide();
          this.electron.showErrorMessages("Login failed.","you entered an incorrect email address or password.");
        });
    }
  }
  // ------------------------------------------------------------------
  // * electron function.
  // ------------------------------------------------------------------
  windowClose() {
    this.electron.windowClose();
  }

  windowMimimize() {
    this.electron.windowMimimize();
  }
}