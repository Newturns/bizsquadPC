import { Electron } from './../../../../providers/electron/electron';
import { AlertProvider } from './../../../../providers/alert/alert';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { Subject } from 'rxjs';
import { BizFireService, LoadingProvider } from '../../../../providers';
import { FormGroup, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ChatService } from '../../../../providers/chat.service';
import {IBizGroup, IUser} from "../../../../_models";
import {IChat} from "../../../../_models/message";
import {STRINGS} from "../../../../biz-common/commons";


@IonicPage({
  name: 'page-profile',
  segment: 'profile',
  priority: 'high'
})
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  // 본인 프로필인지 다른 유저의 프로필인지 체크
  me : boolean = false;
  editProfileForm: FormGroup;

  // 프로필 변경 버튼 클릭
  editProfile : boolean = false;

  // 변경된 값이 있는지
  checkProfile: boolean = false;
  targetValue : IUser;


  notImg : string = '';
  imageSrc : string = '';

  displayName: string;
  group: IBizGroup;
  attachFile: File;

  private _unsubscribeAll;

  private maxFileSize = 1000000; // 1MB

  public langPack : any;

  private displayNameValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.maxLength(20)
  ]);
  private phoneNumberValidator: ValidatorFn = Validators.compose([
    Validators.maxLength(20)
  ]);

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public bizFire : BizFireService,
    public popoverCtrl :PopoverController,
    private loading: LoadingProvider,
    public formBuilder: FormBuilder,
    public alertCtrl : AlertProvider,
    public electron : Electron,
    public chatService: ChatService) {

    this._unsubscribeAll = new Subject<any>();

    this.bizFire.onLang
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((l: any) => {
        this.langPack = l.pack();
    });

    this.targetValue = this.navParams.get('target');
    this.group = this.navParams.get('group');

  }

  ngOnInit(): void {

    // 본인선택시 본인프로필값 / 유저선택시 유저 프로필값 가져옴.

    console.log("targetValue ::",this.targetValue);

    // 본인인가, 유저인가
    this.me = this.bizFire.currentUID == this.targetValue.uid;

    this.editProfileForm = this.formBuilder.group({
      displayName: [this.targetValue.data.displayName, this.displayNameValidator],
      phoneNumber: [this.targetValue.data.phoneNumber, this.phoneNumberValidator],
      email: [this.targetValue.data.email],
      user_visible_firstname: [this.targetValue.data.user_visible_firstname || '',this.phoneNumberValidator],
      user_visible_lastname: [this.targetValue.data.user_visible_lastname || '',this.phoneNumberValidator]
    });

    this.editProfileForm.valueChanges.pipe(takeUntil(this._unsubscribeAll))
    .subscribe(data => {
      this.checkProfile = true;
    })
  }

  editPhoto(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.attachFile = file;

      if(this.attachFile.size > this.maxFileSize) {
        const error = `${this.langPack['error_file_size_too_big']} (max: ${this.maxFileSize/1000000}MB)`;
        this.alertCtrl.failedEditProfile(error);
        this.attachFile = null;
      } else {
        this.loading.show();
        const reader = new FileReader();
        reader.onload = (e: any) => this.imageSrc = e.target.result;

        reader.readAsDataURL(file);

        this.uploadProfile().then(url => {
          const updateProfileData = {
            displayName: this.editProfileForm.value['displayName'],
            photoURL: url
          };
          this.bizFire.afAuth.auth.currentUser.updateProfile(updateProfileData).then(()=>{
            this.bizFire.afStore.doc(`users/${this.bizFire.currentUID}`).update({
              displayName: this.editProfileForm.value['displayName'],
              photoURL: url
            }).then(()=>{
              // clear old value
              this.attachFile = null;
              this.loading.hide();
            }).catch(err => {console.error(err);this.loading.hide()});
          }).catch(err => {console.error(err);this.loading.hide()});
        }).catch(err => {console.error(err);this.loading.hide()});
      }
    }
  }

  uploadProfile(): Promise<string>{
    return new Promise<string>( (resolve, reject) => {
        if(this.attachFile){
            const ref = this.bizFire.afStorage.storage.ref(`users/${this.bizFire.currentUID}/profile.jpeg`);
            ref.put(this.attachFile).then(fileSnapshot => {
                // upload finished.
                this.attachFile = null;

                fileSnapshot.ref.getDownloadURL().then((url) => {
                    resolve(url);

                }).catch(err => {
                    console.error(err);
                });
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        } else {
            console.error(this.attachFile, 'empty');
            reject();
        }
    });
  }

  editSubmit() {
    if(this.editProfileForm.valid && this.checkProfile) {
      this.loading.show();
      const editData = this.editProfileForm.value;
      let updateProfileData;
      updateProfileData = {
        displayName: this.editProfileForm.value['displayName'],
        photoURL: this.bizFire.afAuth.auth.currentUser.photoURL
      };
      this.bizFire.afAuth.auth.currentUser.updateProfile(updateProfileData).then(() =>{
        this.bizFire.editUserProfile(editData).then(() => {
          console.log(this.editProfileForm['displayName'])
          console.log("바뀐값이 없어도 실행됨.");
          this.loading.hide();
          this.viewCtrl.dismiss();
        }).catch(err => {
          this.loading.hide();
          console.log(err)
        })
      })
    } else {
      this.viewCtrl.dismiss();
    }
  }

  gotoChat(){
    let chatRooms = this.chatService.getChatRooms();
    console.log("chatRooms",chatRooms);
    let selectedRoom: IChat;
    for(let room of chatRooms) {
      const member_list = room.data.members;
      const member_count = Object.keys(member_list).length;

      if(Object.keys(member_list).length == 2) {
        if(member_list.hasOwnProperty(this.targetValue.uid)) {
          console.log("조건에 맞는 채팅방이 있습니다.",room);
          selectedRoom = {cid: room.cid,data : room.data} as IChat;
          break;
        }
      }
    }

    if(selectedRoom == null){
      this.chatService.createRoomByProfile(this.targetValue);
    } else {
      this.chatService.onSelectChatRoom.next(selectedRoom);
      this.electron.openChatRoom(selectedRoom);
    }
    this.closePopover();
  }

  closePopover(){
    return this.viewCtrl.dismiss().then(() => {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
