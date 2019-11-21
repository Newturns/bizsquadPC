import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import {ComponentsModule} from "../../components/components.module";
import {AngularFireDatabase} from "@angular/fire/database";
@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    ComponentsModule,
  ],
  providers: [
    AngularFireDatabase
  ]
})
export class LoginPageModule {}
