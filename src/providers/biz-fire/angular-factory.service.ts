import {Injectable, NgZone} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {BizAuth, BizFirestore, BizStorage, TaxlineAuth, TaxlineFirestore, TaxlineStorage} from './factory.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireStorage} from '@angular/fire/storage';
import {ConfigService} from "../../app/config.service";

@Injectable({
  providedIn: 'root'
})
export class AngularFactoryService {

  constructor(
    public _bizFirestore: BizFirestore,
    public _taxlineFirestore: TaxlineFirestore,
    public _bizAuth: BizAuth,
    public _taxlineAuth: TaxlineAuth,
    public _bizStorage: BizStorage,
    public _taxlineStorage: TaxlineStorage,
    private configService: ConfigService,

    ) {

  }


  getFirestore(): AngularFirestore {
    if(this.configService.firebaseName == null){
      throw new Error('this.configService.firebaseName is null.');
    }

    if(this.configService.firebaseName === 'bizsquad'){
      return this._bizFirestore;
    }
    if(this.configService.firebaseName === 'taxline'){
      return this._taxlineFirestore;
    }

  }

  getAuth(): AngularFireAuth {
    if(this.configService.firebaseName == null){
      throw new Error('this.configService.firebaseName is null.');
    }
    if(this.configService.firebaseName === 'bizsquad'){
      // console.error('returning bizsquad auth');
      return this._bizAuth;
    }
    if(this.configService.firebaseName === 'taxline'){
      // console.error('returning taxline auth');
      return this._taxlineAuth;
    }
  }


  getStorage(): AngularFireStorage {
    if(this.configService.firebaseName == null){
      throw new Error('this.configService.firebaseName is null.');
    }
    if(this.configService.firebaseName === 'bizsquad'){
      return this._bizStorage;
    }
    if(this.configService.firebaseName === 'taxline'){
      return this._taxlineStorage;
    }
  }

}
