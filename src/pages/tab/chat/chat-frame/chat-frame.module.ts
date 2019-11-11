import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatFramePage } from './chat-frame';
import { ComponentsModule } from "../../../../components/components.module";
import {Autosize} from "../../../../biz-common/directives/autosize";


@NgModule({
  declarations: [
    ChatFramePage,
    Autosize
  ],
  imports: [
    IonicPageModule.forChild(ChatFramePage),
    ComponentsModule,
  ],
})
export class ChatFramePageModule {}
