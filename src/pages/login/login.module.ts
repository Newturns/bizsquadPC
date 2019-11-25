import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import {ComponentsModule} from "../../components/components.module";
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireModule} from "@angular/fire";
import {environment} from "../../environments/environments";
@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    AngularFireModule.initializeApp(environment.taxline),
    ComponentsModule,
  ],
  providers: [
    AngularFireDatabase
  ]
})
export class LoginPageModule {}
