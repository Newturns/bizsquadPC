import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNoticeComponent } from './chat-notice.component';

describe('ChatNoticeComponent', () => {
  let component: ChatNoticeComponent;
  let fixture: ComponentFixture<ChatNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
