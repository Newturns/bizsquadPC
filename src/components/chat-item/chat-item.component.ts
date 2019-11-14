import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {filter} from "rxjs/operators";
import {TakeUntil} from "../../biz-common/take-until";
import {IChat, IMessageData} from "../../_models/message";
import {CacheService} from "../../providers/cache/cache";
import {ChatService} from "../../providers/chat.service";
import {IUnreadMap} from "../../pages/tab/chat/unread-counter";
import {Commons} from "../../biz-common/commons";
import {IUser} from "../../_models";
import {BizFireService} from "../../providers";


@Component({
  selector: 'biz-chat-item',
  templateUrl: './chat-item.component.html',
})
export class ChatItemComponent extends TakeUntil implements OnInit {

  chatBox: IChat;
//시간, 메시지내용, 언리드?, 아이콘
// lastMessage.created
// lastMessage.message.text
// data.members.length
//

  @Input()
  set chat(c: IChat){
    this.loadChat(c);
  }

  @Input()
  set unread(count : number) {
    this.unreadCount = count;
  }

  lastMessage: IMessageData;

  //스쿼드 아이템이 선택됐을 때 css를 변경한다.
  @Input()
  chatSelected:boolean = false;

  @Input()
  squadColor:string;

  //박스내에 자물쇠, 코멘트 등의 이벤트가 필요할 때 쓰도록 한다.
  // @Input()
  // func:[]

  @Output()
  clickedFunc = new EventEmitter<any>();

  chatTitle: string;
  unreadCount: number = 0;

  constructor(private cacheService: CacheService,
              private bizFire : BizFireService,
              private chatService: ChatService) {
    super();
  }

  ngOnInit() {

    this.chatService.unreadCountMap$
      .pipe(
        this.takeUntil,
        filter(d=>d!=null)
      )
      .subscribe((list: IUnreadMap) => {
        if(list.get(this.chatBox.cid) != null){
          this.unreadCount = list.get(this.chatBox.cid).unreadList.length;
        }
      });

  }

  onClickFunc(){
    // this.chatSelected = true;
    //  ↓테스트용↓
    this.clickedFunc.emit(this.chatBox);
  }

  private loadChat(c: IChat){
    if(c != null){
      this.chatBox = c;
      this.chatTitle = this.chatBox.data.title;
      this.lastMessage = this.chatBox.data.lastMessage;
      if(this.chatTitle == null){
        this.reloadTitle();
      }
    }
  }

  removeHtml(text: string): string {
    return Commons.removeHtmlTag(text);
  }

  private   reloadTitle(){

    if(this.chatBox == null){
      return;
    }
    // this._squadChat = this.chatBox.data.type !== 'member';

    this.chatTitle = this.chatBox.data.title || this.chatBox.data.name;
    /*if(this.chatBox.data.type === 'member') {

    } else {
      this.userCount = this.chatBox.isPublic() ? this.bizFire.currentBizGroup.getMemberCount() : this.chatBox.getMemberCount();
      // 스쿼드 채팅방은 제목 생성 불가.
      // this.chatTitle = this.chatBox.data.name;
    }*/

    if(this.chatTitle == null) {
      this.chatTitle = '';
      // if not, create title with user names.
      this.cacheService.resolvedUserList(this.chatBox.getMemberIds(false), Commons.userInfoSorter)
        .subscribe((users :IUser[]) => {
          users.forEach(u => {
            if(this.chatTitle.length > 0){
              this.chatTitle += ',';
            }
            this.chatTitle += u.data.displayName;
          });

          if(users.length === 0){
            // no user left only me.
            // add no user
            this.chatTitle = 'No users';
          }
        });
    }
  }


  senderUid() : string {

    const lastMessage = this.chatBox.data.lastMessage;

    if(lastMessage) {
      if(lastMessage.sender) {
        return lastMessage.sender;
      } else {
        return this.bizFire.uid;
      }
    } else {
      return  this.bizFire.uid;
    }
  }
}
