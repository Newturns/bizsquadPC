import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BizCheckBtnComponent } from './biz-check-btn.component';

describe('BizCheckBtnComponent', () => {
  let component: BizCheckBtnComponent;
  let fixture: ComponentFixture<BizCheckBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BizCheckBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BizCheckBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
