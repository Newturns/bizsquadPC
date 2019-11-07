import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLogoComponent } from './group-logo.component';

describe('GroupLogoComponent', () => {
  let component: GroupLogoComponent;
  let fixture: ComponentFixture<GroupLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
