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
import {SquadFilterComponent} from "./squad-filter/squad-filter.component";
import {SquadItemComponent} from "./squad-item/squad-item.component";
import {TeamIconComponent} from "./team-icon/team-icon.component";

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
    SquadFilterComponent,
    SquadItemComponent,
    TeamIconComponent,
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
    SquadFilterComponent,
    SquadItemComponent,
    TeamIconComponent
  ],
  entryComponents: [
    ChatHeaderComponent,
    MembersPopoverComponent
  ]
})
export class ComponentsModule { }
