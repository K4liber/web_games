import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';
import { getTimeNowString } from 'src/app/common';
import { Message } from '../types';

@Component({
  selector: 'chat-content',
  templateUrl: './content.component.html',
  styles: [
    `
    .float-right {
      float:right;
    }
    `,
    `
    .chat-main {
      min-height: 35px;
    }
    `
  ]
})
export class ContentComponent implements OnInit {
  @Input() username: string = ''

  isChatHiden: boolean = true;
  messages: Message[] = [];
  currentMessage: string = '';
  lastProgressClass: string = 'last-info'

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private socket: SocketService
  ) { }

  ngOnInit(): void {
    this.socket.on('notify', (message: string) => {
      this.onNotify(message)
    })
    this.socket.on('returndata', (message: string) => {
      this.onNotify(message)
    })
    this.socket.on('user_disconnected', (username: string) => {
      this.onNotify("[" + username + "] have left! Bye bye!")
    })
  }

  onNotify(message: string) {
    let messageWithTimestamp = "(" + getTimeNowString() + ") " + message
    this.messages.unshift({
      content: messageWithTimestamp,
      author: null
    })
    this.lastProgressClass = 'last-info'
    this.changeDetectorRef.detectChanges()
    setTimeout(
      () => {
        this.lastProgressClass = 'normal-info'
        this.changeDetectorRef.detectChanges()
      }, 1000
    )
    this.changeDetectorRef.detectChanges()
  }

  changeChatHiden() {
    this.isChatHiden = !this.isChatHiden
    this.changeDetectorRef.detectChanges()
  }

  submitMessage() {
    this.socket.emit('data', "[" + this.username + "]: " + this.currentMessage);
    this.currentMessage = ''
  }

  get changeChatHidenText() {
    return this.isChatHiden ? "Show Chat" : "Hide Chat"
  }

}
