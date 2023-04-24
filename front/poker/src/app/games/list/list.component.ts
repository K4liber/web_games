import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';
import { GameService } from 'src/app/game.service';
import { Game } from '../types';

@Component({
  selector: 'games-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  games: Game[] = [];
  gameService: GameService;
  currentView: string = 'list';

  constructor(
    gameService: GameService,
    private socket: SocketService
  ) { 
    this.gameService = gameService
    this.socket.on('games_list', (games: Game[]) => {
      this.games = games
    })
    this.socket.emit('get_games')
  }

  ngOnInit(): void {
  }

  joinGame(gameName: string): void {
    this.socket.emit('join_game', gameName)
  }

  leaveGame(): void {
    this.socket.emit('leave')
    this.gameService.setGame(null)
  }

  refreshList() {
    this.socket.emit('get_games')
  }
}
