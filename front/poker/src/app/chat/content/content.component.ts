import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
    .chat-messages {
      height: -webkit-calc(100% - 40px);
      height:    -moz-calc(100% - 40px);
      height:         calc(100% - 40px);
    }
    `
  ]
})
export class ContentComponent implements OnInit, OnChanges {
  @Input() username: string = ''
  @Input() doShow : EventEmitter<boolean> | null = null;
  
  messages: Message[] = [];
  currentMessage: string = '';
  lastProgressClass: string = 'last-info'
  showContent: boolean = false;

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
    this.loadDoShow()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doShow'] && changes['doShow'].currentValue) {
      this.doShow = changes['doShow'].currentValue
    }
    this.loadDoShow()
  }

  loadDoShow() {
    if (this.doShow) {
      this.doShow.subscribe((doShow) => {
        this.showContent = doShow
        this.scrollMessagesDown()
      })
    }
  }

  onNotify(message: string) {
    let messageWithTimestamp = "(" + getTimeNowString() + ") " + message
    this.messages.push({
      content: messageWithTimestamp,
      author: null
    })
    this.lastProgressClass = 'last-info'
    setTimeout(
      () => {
        this.lastProgressClass = 'normal-info'
        this.changeDetectorRef.detectChanges()
      }, 1000
    )
    this.changeDetectorRef.detectChanges()
    this.scrollMessagesDown()
  }

  scrollMessagesDown() {
    let el = document.getElementById('messages');

    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }

  submitMessage() {
    this.socket.emit('data', "[" + this.username + "]: " + this.currentMessage);
    this.currentMessage = ''
  }

}
