import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomlinkPage } from './customlink';
import {ComponentsModule} from "../../../../components/components.module";

@NgModule({
  declarations: [
    CustomlinkPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomlinkPage),
    ComponentsModule
  ],
})
export class CustomlinkPageModule {}
