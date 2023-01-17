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
  doShowBluff: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowChat: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowLastSettlement: EventEmitter<boolean> = new EventEmitter<boolean>();
  viewNameToEmitter: Record<string, EventEmitter<boolean>>

  constructor(
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.viewNameToEmitter = {
      'table': this.doShowBluff,
      'chat': this.doShowChat,
      'last': this.doShowLastSettlement
    }
  }

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

  selectView(view: string) {
    let previousEmitter = this.viewNameToEmitter[this.currentView]
    previousEmitter.emit(false)
    let currentEmitter = this.viewNameToEmitter[view]
    currentEmitter.emit(true)
    this.currentView = view
    this.changeDetectorRef.detectChanges()
  }

}
