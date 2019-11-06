import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberPage } from './member';
import { AccountService } from './../../../providers/account/account';
import {ComponentsModule} from "../../../components/components.module";
@NgModule({
  declarations: [
    MemberPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberPage),
    ComponentsModule,
  ],
  providers: [
    AccountService
  ]
})
export class MemberPageModule {}
