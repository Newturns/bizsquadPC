import { BizFireService } from './../providers/biz-fire/biz-fire';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { MyApp } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//electron
import { Electron } from '../providers/electron/electron';

import { LoadingProvider } from '../providers';
import { AlertProvider } from '../providers/alert/alert';

//firebase
import { AngularFireModule } from '@angular/fire';
import { environment } from './../environments/environments';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { TokenProvider } from '../providers/token/token';
import { GroupColorProvider } from '../providers/group-color';
import { HttpClientModule } from '@angular/common/http';
import { CacheService } from '../providers/cache/cache';
import { ToastProvider } from '../providers/toast/toast';
import {UserStatusProvider} from "../providers/user-status";
import {ComponentsModule} from "../components/components.module";
import {PreloadAllModules, RouteReuseStrategy, RouterModule, Routes} from "@angular/router";
import {ConfigService} from "./config.service";
import {IonicModule, IonicRouteStrategy} from "@ionic/angular";
import {IonicErrorHandler} from "ionic-angular";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginPageModule'
  },
  {
    path: ':firebaseName', // 'bizsquad', 'taxline' 등의 DB명이 온다.
    canLoad:[
      ConfigService, // check ConfigService.firebaseName with Master server
    ],
    loadChildren: ()=> import('../main/main.module').then(m => m.MainModule)
  }
];

@NgModule({
  declarations: [MyApp],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    RouterModule.forRoot(routes,{ preloadingStrategy: PreloadAllModules }),
    HttpClientModule,
    BrowserAnimationsModule,
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFirestoreModule,
    // AngularFireStorageModule,
    // AngularFireAuthModule,
    // ComponentsModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Electron,
    // LoadingProvider,
    // BizFireService,
    // AlertProvider,
    // TokenProvider,
    // GroupColorProvider,
    // UserStatusProvider,
    // CacheService,
    // ToastProvider,
  ],
  bootstrap: [MyApp],
})
export class AppModule {}
