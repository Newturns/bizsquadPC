import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAttachComponent } from './chat-attach.component';

describe('ChatAttachComponent', () => {
  let component: ChatAttachComponent;
  let fixture: ComponentFixture<ChatAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
