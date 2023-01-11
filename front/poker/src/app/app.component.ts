import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLogged: boolean = false;
  username: string = '';
  currentView: string = 'table'
  isChatHiden: boolean = true;
  doShowBluff: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowChat: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    document.body.className = "main";
  }

  usernameChanged(username: string) {
    if (username.trim() === '') {
      this.isLogged = false;
      this.doShowBluff.emit(false)
      this.doShowChat.emit(false)
    } else {
      this.isLogged = true;
      this.doShowBluff.emit(true)
    }
    
    this.username = username
    this.changeDetectorRef.detectChanges()
  }

  myTurn(isMyTurn: boolean) {
    if (isMyTurn) {
      this.titleService.setTitle('* Bluff - your turn!')
    } else {
      this.titleService.setTitle('Bluff')
    }
  }

  changeChatHiden() {
    this.isChatHiden = !this.isChatHiden
    this.doShowChat.emit(!this.isChatHiden)
    this.doShowBluff.emit(this.isChatHiden)
    this.changeDetectorRef.detectChanges()
  }

  get changeChatHidenText() {
    return this.isChatHiden ? "Show Chat" : "Show Table"
  }
}
