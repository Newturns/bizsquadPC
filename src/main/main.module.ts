import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
// import {HomeGuard} from '../core/home-guard';
// import {GidLoadService} from '../core/gid-load.service';
// import {MainLoginService} from './main-login.service';
import {AngularFireModule} from '@angular/fire';

import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFirestoreModule, FirestoreSettingsToken} from '@angular/fire/firestore';


const routes: Routes = [
  {
    path: '',
    canActivate: [
      // HomeGuard, // check login
      // GidLoadService, // check last gid.
    ],
    canActivateChild:[

    ],
    children: [
      {
        path: '',
        redirectTo: 'tabs'
      },
      {
        path: 'tabs',
        loadChildren: () => import('../pages/tabs/tabs.module').then(m => m.TabsPageModule),
      },
    ]
  }
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  providers:[
    // MainLoginService,
    // GidLoadService,
  ]
})
export class MainModule { }
