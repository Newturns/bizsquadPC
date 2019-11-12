import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InviteRoomPage } from './invite-room';
import { AccountService } from '../../../../../providers/account/account';
import {ComponentsModule} from "../../../../../components/components.module";

@NgModule({
  declarations: [
    InviteRoomPage,
  ],
  imports: [
    IonicPageModule.forChild(InviteRoomPage),
    ComponentsModule
  ],
  providers: [
    AccountService
  ]
})
export class InviteRoomPageModule {}
