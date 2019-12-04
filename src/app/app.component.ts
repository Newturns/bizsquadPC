
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})
export class MyApp {

  rootPage:any = 'page-login';

  constructor(
    ) {
  }


  ngOnInit(): void {

    console.log("app component Ts");
  }

  ionViewDidLoad(){
  }
}

