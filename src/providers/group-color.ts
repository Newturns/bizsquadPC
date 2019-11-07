import { Injectable } from '@angular/core';

@Injectable()
export class GroupColorProvider {

  constructor() {
  // default: #5b9ced,
  //     grey: grey,
  //     warn: #f44336,
  //     accent: #ff4081,
  //     primary: #3f51b5,
  //     facebook: #3b5998,
  //     green: green,
  //     lightskyblue: lightskyblue,
  //     dark: #111111,
  //     forestgreen: forestgreen,
  //     blue: blueviolet,
  }

  makeGroupColor(string) {
    switch(string) {
      case '#324ca8':
        return 'duskblue';
      case '#eb5757':
        return 'red';
      case '#ffc107':
        return 'orange';
      case '#219653':
        return 'green';
      case '#2f80ed':
        return 'blue';
      case '#9b51e0':
        return 'purple';
      case '#4f4f4f':
        return 'dark';
      case undefined:
       return 'duskblue';
      default:
       return 'duskblue';
    }
  }

  makeSquadColor(data) {
      if(data.type === 'public'){
        switch(data.color) {
            case undefined:
                return 'dodgerblue';
            default:
                return data.color;
          }
      } else {
        switch(data.color) {
            case undefined:
                return 'green';
            default:
                return data.color;
          }
      }
  }

}
