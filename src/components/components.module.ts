import { NgModule} from '@angular/core';
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { ChatRoomComponent } from './chat-room/chat-room';
import {CommonModule} from "@angular/common";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {PipesModule} from "../pipes/pipes.module";
import {IonicModule} from "ionic-angular";
import {LastMessageComponent} from "./last-message/last-message.component";
import { ChatHeaderComponent } from './chat-header/chat-header';
import {MessageComponent} from "./message/message.component";
import {QuillModule} from 'ngx-quill';
import {AvatarButtonComponent} from "./avatar-button/avatar-button.component";
import {ImgComponent} from "./img/img.component";
import { MembersPopoverComponent } from './members-popover/members-popover';
import { ChangeTitlePopoverComponent } from './change-title-popover/change-title-popover';
import { WarnPopoverComponent } from './warn-popover/warn-popover';
import {SquadFilterComponent} from "./squad-filter/squad-filter.component";
import {SquadItemComponent} from "./squad-item/squad-item.component";
import {TeamIconComponent} from "./team-icon/team-icon.component";
import {GroupColorDirective} from "../biz-common/directives/group-color.directive";
import {BizButtonComponent} from "./biz-button/biz-button.component";
import {NoticeItemComponent} from "./notice-item/notice-item.component";
import {ChatItemComponent} from "./chat-item/chat-item.component";
import {GroupLogoComponent} from "./group-logo/group-logo.component";
import {BizCheckBtnComponent} from "./biz-check-btn/biz-check-btn.component";
import {ChatNoticeComponent} from "./chat-notice/chat-notice.component";
import {MessageBalloonComponent} from "./message-balloon/message-balloon.component";
import {ChatAttachComponent} from "./chat-attach/chat-attach.component";

@NgModule({
	declarations: [
	  ProgressBarComponent,
    ChatRoomComponent,
    LastMessageComponent,
    ChatHeaderComponent,
    MessageComponent,
    AvatarButtonComponent,
    ImgComponent,
    MembersPopoverComponent,
    ChangeTitlePopoverComponent,
    WarnPopoverComponent,
    SquadFilterComponent,
    SquadItemComponent,
    TeamIconComponent,
    BizButtonComponent,
    NoticeItemComponent,
    ChatItemComponent,
    GroupLogoComponent,
    BizCheckBtnComponent,
    ChatNoticeComponent,
    MessageBalloonComponent,
    ChatAttachComponent,
    GroupColorDirective,
  ],
  imports: [
    CommonModule,
    NgbModule,
    PipesModule,
    IonicModule,
    //QuillEditor
    QuillModule.forRoot(),

  ],
  exports: [
    ProgressBarComponent,
    ChatRoomComponent,
    LastMessageComponent,
    NgbModule,
    ChatHeaderComponent,
    MessageComponent,
    AvatarButtonComponent,
    ImgComponent,
    MembersPopoverComponent,
    ChangeTitlePopoverComponent,
    WarnPopoverComponent,
    SquadFilterComponent,
    SquadItemComponent,
    TeamIconComponent,
    BizButtonComponent,
    NoticeItemComponent,
    ChatItemComponent,
    GroupLogoComponent,
    BizCheckBtnComponent,
    ChatNoticeComponent,
    GroupColorDirective,
    ChatAttachComponent,
    MessageBalloonComponent,

  ],
  entryComponents: [
    ChangeTitlePopoverComponent,
    WarnPopoverComponent,
    ChatHeaderComponent,
    MembersPopoverComponent,
  ]
})
export class ComponentsModule { }
