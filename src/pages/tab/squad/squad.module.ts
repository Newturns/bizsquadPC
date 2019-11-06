import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SquadPage } from './squad';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    SquadPage,
  ],
  imports: [
    IonicPageModule.forChild(SquadPage),
    ComponentsModule,
  ],
})
export class SquadPageModule {}
