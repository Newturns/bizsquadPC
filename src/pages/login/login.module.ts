import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import {ComponentsModule} from "../../components/components.module";
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireModule} from "@angular/fire";
import {environment} from "../../environments/environments";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ComponentsModule,
  ],
  declarations: [LoginPage],
  providers: [
    AngularFireDatabase
  ]
})
export class LoginPageModule {}
