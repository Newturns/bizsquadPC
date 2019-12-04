import {ElementRef, HostListener, Directive, OnInit, Input} from '@angular/core';

@Directive({
  selector: 'ion-textarea[autosize]'
})

export class Autosize implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea:HTMLTextAreaElement):void {
    this.adjust();
  }

  @Input('autosize') maxHeight: number;

  constructor(public element:ElementRef) {}

  ngOnInit():void {
    this.adjust();
  }

  // adjust():void {
  //   const textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
  //   textArea.style.overflow = 'hidden';
  //   textArea.style.height = 'auto';
  //   textArea.style.height = textArea.scrollHeight + 'px';
  // }

  adjust(): void {
    let ta = this.element.nativeElement.querySelector("textarea"),
      newHeight;

    if (ta) {
      ta.style.overflow = "hidden";
      ta.style.height = "auto";
      if (this.maxHeight) {
        newHeight = Math.min(ta.scrollHeight, this.maxHeight);
      } else {
        newHeight = ta.scrollHeight;
      }
      ta.style.height = newHeight + "px";
    }
  }
}
