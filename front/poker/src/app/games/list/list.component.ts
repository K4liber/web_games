import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';
import { Game } from '../types';

@Component({
  selector: 'games-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  games: Game[] = [
    {
      name: 'Dota',
      host: 'Jasiek',
      players: [
        'xd', 'anything'
      ],
      isPublic: true,
      isStarted: false,
      maxNumberOfPlayers: 6
    },
    {
      name: 'test123',
      host: 'Jasiek',
      players: [],
      isPublic: true,
      isStarted: false,
      maxNumberOfPlayers: 6
    },
    {
      name: 'Any',
      host: 'Jasiek',
      players: [
        'xd', 'anything', 'test', 'xd', 'anything', 'test'
      ],
      isPublic: true,
      isStarted: false,
      maxNumberOfPlayers: 6
    }
  ];
  gameService: GameService;
  currentView: string = 'list';

  constructor(
    gameService: GameService
  ) { 
    this.gameService = gameService
  }

  ngOnInit(): void {
  }

  joinGame(gameName: string): void {
    this.gameService.currentGame = gameName
  }

  leaveGame(): void {
    this.gameService.currentGame = null
  }

}
