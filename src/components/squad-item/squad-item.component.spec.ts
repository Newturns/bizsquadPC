import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadItemComponent } from './squad-item.component';

describe('SquadItemComponent', () => {
  let component: SquadItemComponent;
  let fixture: ComponentFixture<SquadItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquadItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
