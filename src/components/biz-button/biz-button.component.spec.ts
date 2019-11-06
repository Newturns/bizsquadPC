import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BizButtonComponent } from './biz-button.component';

describe('BizButtonComponent', () => {
  let component: BizButtonComponent;
  let fixture: ComponentFixture<BizButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BizButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BizButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
