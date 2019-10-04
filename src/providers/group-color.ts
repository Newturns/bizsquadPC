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
      case '#324BA8':
        return 'darkblue';
      case '#6979F8':
        return 'blue';
      case '#FFCF5C':
        return 'warn';
      case '#FFA26B':
        return 'accent';
      case '#0084F4':
        return 'primary';
      case '#00C48C':
        return 'green';
      case '#FF647C':
        return 'warm';
      case '#D0C9D6':
        return 'gray';
      case '#3b5998':
        return 'facebook';
      case '#111111':
        return 'dark';
      case undefined:
       return 'default';
      default:
       return 'default';
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
