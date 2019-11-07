import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitePage } from './invite';
import { AccountService } from './../../../../providers/account/account';
import {ComponentsModule} from "../../../../components/components.module";

@NgModule({
  declarations: [
    InvitePage,
  ],
  imports: [
    IonicPageModule.forChild(InvitePage),
    ComponentsModule
  ],
  providers: [
    AccountService,
  ]
})
export class InvitePageModule {}
