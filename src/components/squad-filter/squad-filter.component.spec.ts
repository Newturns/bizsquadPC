import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadFilterComponent } from './squad-filter.component';

describe('SquadFilterComponent', () => {
  let component: SquadFilterComponent;
  let fixture: ComponentFixture<SquadFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquadFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquadFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
