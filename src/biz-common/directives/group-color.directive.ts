import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {COLORS, NEWCOLORS} from '../colors';
import {TakeUntil} from '../take-until';
import {IBizGroup} from '../../_models';
import {BehaviorSubject, combineLatest, Subject, timer} from 'rxjs';
import {BizFireService} from "../../providers";

@Directive({
  selector: '[bizGroupColor]'
})
export class GroupColorDirective extends TakeUntil implements OnInit,OnDestroy{


  team_color;

  @Input()
  color;
  teamSubColor;

  group: IBizGroup;
  private group$ = new Subject<IBizGroup>();

  @Input()
  mainColor: string;

  @Input()
  useMainBackGround = true; // default makes background theme color.

  @Input()
  useSubColor = false;

  @Input()
  set selected(selected: boolean){
    if(this.selected$.getValue() == null){

    }
    this.selected$.next(selected);
    // timer(0).subscribe(()=>this.selected$.next(selected)); // combineLatest가 두번불림.
  }
  private selected$ = new BehaviorSubject<any>(null);

  @Input()
  set useTextColor(value: boolean) {
    // never use background.
    this.useMainBackGround = false;
    this.useTextColor$.next(value);
  }
  get useTextColor(): boolean {
    return this.useTextColor$.getValue();
  }
  private useTextColor$ = new BehaviorSubject<boolean>(false);

  @Input()
  set hover(value: boolean) {
    this._hover = value;
    if(value === true){
      this.useMainBackGround = false;
    }
  }
  get hover(): boolean {
    return this._hover;
  }

  private _hover = false;

  constructor(private bizFire: BizFireService,
              private el: ElementRef) {
    super();



  }

  ngOnInit(): void {


    combineLatest(this.bizFire.onBizGroupSelected, this.selected$, this.useTextColor$)
      .pipe(this.takeUntil)
      .subscribe(([g, selected, useTextColor])=>{
        if(this.group && this.group.gid == g.gid){
          // same group changed.
          // do nothing.
        } else {
          // reload all colors.
          this.group = g;
          this.loadColors();
        }

        if(selected != null){
          if(selected){
            // set background to subColor of 5%
            this.el.nativeElement.style.backgroundColor = this.hexAToRGBA(this.teamSubColor);
          } else {
            // clear background
            this.el.nativeElement.style.backgroundColor = null;
          }
        } else {

          // combineLatest에서 teamSubColor가 다시 this.teamSubColor = g.data.team_subColor || NEWCOLORS.duskblue.sub;
          // mouseenter 이벤트에서 직접 함수 호출.hexAToRGBA()
          if(this.hover === true){

            //----------------------------------------------//
            // mouse hover 시 배경색만 subColor 로 변경 처리.
            //----------------------------------------------//
            // convert #ddddd to rgba()
            this.teamSubColor = this.hexAToRGBA(this.teamSubColor);

            // color must not be set
            // this.el.nativeElement.style.color = null;

          }

          if(this.useMainBackGround === true){
            // set ONLY background
            this.el.nativeElement.style.backgroundColor = this.useSubColor ? this.teamSubColor : this.team_color;
            // color must be white.
            this.el.nativeElement.style.color = this.color;

          } else {

            if(useTextColor === true) {
              // set only text
              this.el.nativeElement.style.color = this.useSubColor ? this.teamSubColor : this.team_color;
            } else {
              this.el.nativeElement.style.color = null;
            }
          }
        }

      });
  }

  @HostListener('mouseenter') onMouseEnter() {
    if(this.hover){
      if(this.teamSubColor){
        this.el.nativeElement.style.backgroundColor = this.hexAToRGBA(this.teamSubColor);
      }
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if(this.hover){
      this.el.nativeElement.style.backgroundColor = null;
    }
  }

  private loadColors(){

    const g = this.group;
    if(g == null)return;

    this.team_color = this.mainColor || g.data.team_color || NEWCOLORS.duskblue.main;
    if(this.color == null){
      this.color = g.data.team_fontColor || 'white';
    }
    this.teamSubColor = g.data.team_subColor || NEWCOLORS.duskblue.sub;

  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private hexAToRGBA(h) {
    let r, g, b;
    const a = 0.05;
    if (h.length == 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }
    return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
  }
}

