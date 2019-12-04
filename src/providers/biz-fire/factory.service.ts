import {Injectable, NgZone} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {environment} from "../../environments/environments";

/*@Injectable({
  providedIn: 'root'
})*/

@Injectable()
export class BizFirestore extends AngularFirestore {}
@Injectable()
export class TaxlineFirestore extends AngularFirestore {}
@Injectable()
export class BizAuth extends AngularFireAuth {}
@Injectable()
export class TaxlineAuth extends AngularFireAuth {}
@Injectable()
export class BizStorage extends AngularFireStorage {}
@Injectable()
export class TaxlineStorage extends AngularFireStorage {}
@Injectable()
export class BizMessaging extends AngularFireMessaging {}
@Injectable()
export class TaxlineMessaging extends AngularFireMessaging {}

export function BizFirestoreFactory(platformId: Object, zone: NgZone) {
  return new AngularFirestore(environment.bizsquad, 'bizsquad', false, null, platformId, zone, null);
}
export function TaxlineFirestoreFactory(platformId: Object, zone: NgZone) {
  return new AngularFirestore(environment.taxline, 'taxline', false, null, platformId, zone, null);
}
export function BizAuthFactory(platformId: Object, zone: NgZone) {
  return new AngularFireAuth(environment.bizsquad, 'bizsquad', platformId, zone);
}
export function TaxlineAuthFactory(platformId: Object, zone: NgZone) {
  return new AngularFireAuth(environment.taxline, 'taxline', platformId, zone);
}
export function BizStorageFactory(platformId: Object, zone: NgZone) {
  return new AngularFireStorage(environment.bizsquad, 'bizsquad', null, platformId, zone);
}
export function TaxlineStorageFactory(platformId: Object, zone: NgZone) {
  return new AngularFireStorage(environment.taxline, 'taxline', null, platformId, zone);
}

export function BizMessagingFactory(platformId: Object, zone: NgZone) {
  return new AngularFireMessaging(environment.bizsquad, 'bizsquad', platformId, zone);
}
export function TaxlineMessagingFactory(platformId: Object, zone: NgZone) {
  return new AngularFireMessaging(environment.taxline, 'taxline',  platformId, zone);
}
