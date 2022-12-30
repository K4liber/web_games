import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';
import { Message } from '../types';

@Component({
  selector: 'chat-content',
  templateUrl: './content.component.html',
  styles: [
    
  ]
})
export class ContentComponent implements OnInit {
  @Input() username: string = ''

  isChatHiden: boolean = true;
  messages: Message[] = [];
  currentMessage: string = '';

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
  }

  onNotify(message: string) {
    this.messages.push({
      content: message,
      author: null
    })
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
