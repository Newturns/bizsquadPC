import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageBalloonComponent } from './message-balloon.component';

describe('MessageBalloonComponent', () => {
  let component: MessageBalloonComponent;
  let fixture: ComponentFixture<MessageBalloonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageBalloonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageBalloonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
