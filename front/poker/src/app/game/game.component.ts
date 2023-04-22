import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  isLogged: boolean = false;
  username: string = '';
  currentView: string = 'games'
  currentGame: string | null = null
  doShowGames: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowBluff: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowChat: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowLastSettlement: EventEmitter<boolean> = new EventEmitter<boolean>();
  viewNameToEmitter: Record<string, EventEmitter<boolean>>

  constructor(
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.viewNameToEmitter = {
      'games': this.doShowGames,
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
      this.doShowGames.emit(false)
    } else {
      this.isLogged = true;
      this.doShowGames.emit(true)
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