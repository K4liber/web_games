import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SocketService } from '../app-socket.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  gameService: GameService
  currentView: string = 'games'
  doShowGames: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowBluff: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowChat: EventEmitter<boolean> = new EventEmitter<boolean>();
  doShowLastSettlement: EventEmitter<boolean> = new EventEmitter<boolean>();
  viewNameToEmitter: Record<string, EventEmitter<boolean>>

  constructor(
    gameService: GameService,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef,
    private socket: SocketService
  ) {
    this.gameService = gameService
    this.viewNameToEmitter = {
      'games': this.doShowGames,
      'table': this.doShowBluff,
      'chat': this.doShowChat,
      'last': this.doShowLastSettlement
    }
    this.socket.on('join_succeess', (join_data: [string, string[]]) => {
      this.gameService.setGame(join_data[0])
      this.gameService.players.emit(join_data[1])
      this.selectView('table')
    })
    this.gameService.usernameChange.subscribe(username => {
      this.usernameChanged(username)
    })
  }

  ngOnInit() {
    document.body.className = "main";
  }

  usernameChanged(username: string | null) {
    if (username === null) {
      this.doShowBluff.emit(false)
      this.doShowChat.emit(false)
      this.doShowGames.emit(false)
    } else {
      this.doShowGames.emit(true)
    }
    
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