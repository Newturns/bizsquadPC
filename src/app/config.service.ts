import {Injectable, NgZone, Optional, SkipSelf} from '@angular/core';
import {CanLoad, Route, Router, UrlSegment} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {environment} from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements CanLoad {

  // null로 설정시, BizFire생성자에서 authState가 에러.
  private _firebaseName: string = null;
  get firebaseName(): string {
    return this._firebaseName;
  }
  set firebaseName(name: string){
    this._firebaseName = name;
    this.firebaseName$.next(this._firebaseName);
  }
  firebaseName$ = new BehaviorSubject<string>(null);

  // run time data test.
  /*static taxline = {
    apiKey: "AIzaSyDXseHSdM-TRJcR_OpNBH2PWERP2PRxDlk",
    authDomain: "dev-bizsquad.firebaseapp.com",
    databaseURL: "https://dev-bizsquad.firebaseio.com",
    projectId: "dev-bizsquad",
    storageBucket: "dev-bizsquad.appspot.com",
    messagingSenderId: "247168431751",
    appId: "1:247168431751:web:d57417b40da2cdc6696a22"
  };*/

  constructor(@Optional() @SkipSelf() private mySelf: ConfigService,
              private http: HttpClient,
              private router: Router

              ) {
    if(mySelf){
      throw new Error('ConfigService already loaded.');
    }
  }

  canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {

    return new Promise<boolean>( (resolve, reject) => {

      console.log('ConfigService canLoad', segments.map(s => s.path).join('/'));

      let firebaseNameOfUrl;
      if(segments.length > 0){
        firebaseNameOfUrl = segments[0].path;
      }

      // refresh 대응.
      // URL 에서 'taxline' 을 찾아 서버에 확인한 후, 다음 라우트로 허가
      if(this.firebaseName == null || this.firebaseName !== firebaseNameOfUrl){

        if(firebaseNameOfUrl){

          this.checkCompanyName(firebaseNameOfUrl).then(()=>{
            resolve(true);
          }).catch(e => {
            console.error('ConfigService::canLoad firebaseNameOfUrl error.');
            console.error(e);
            // route to login
            this.router.navigate(['/login']);
            resolve(false);
          });
        } else {
          // segments[0] is null.
          // 주소에, db 네임 아무것나 넣고 리프레쉬중일 가능성...
          // login 화면으로 보낸다.
          console.error('ConfigService::canLoad', 'firebase name not found.');
          console.error('redirect to /login');
          this.router.navigate(['/login']);
          resolve(false);
        }
      } else {
        // go to next route.
        resolve(true);
      }

    });

  }

  checkCompanyName(company: string): Promise<any>{

    return new Promise<boolean>((resolve, reject) => {
      if(company == null || company.length === 0){
        reject({code: 'companyNotFound', message: 'Sorry, Company name required.'});
        return;
      }
      company = company.toLowerCase().trim();

      this.http.get(`${environment.masterUrl}/servers.json`)
        .subscribe( data => {
          if(data){
            const found = Object.keys(data).find(value => company === value);
            if(found){
              // save
              this.firebaseName = company;
              resolve(true);
            } else {
              reject({message: `Sorry, Invalid company name [${company}]`, code: 'companyNotFound'});
            }
          }
        });
    });
  }


  /*static taxlineFactory(){
    return (platformId: Object, zone: NgZone) => {
      return new AngularFirestore(this.taxline, 'taxline', false, null, platformId, zone, null);
    }
  }*/
}
