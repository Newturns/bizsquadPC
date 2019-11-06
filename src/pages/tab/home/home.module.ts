import { AccountService } from './../../../providers/account/account';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import {PipesModule} from "../../../pipes/pipes.module";

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    PipesModule,
  ],
  providers: [
    AccountService,
  ]
})
export class HomePageModule {}
