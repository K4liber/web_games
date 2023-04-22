import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GameService } from 'src/app/game.service';
import { Game } from '../types';

@Component({
  selector: 'games-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class GamesContentComponent implements OnInit, OnChanges {
  @Input() username: string = ''
  @Input() doShow : EventEmitter<boolean> | null = null;

  showContent: boolean = false;
  games: Game[] = [
    {
      name: 'Dota',
      host: 'Jasiek',
      players: [

      ],
      isPublic: true,
      isStarted: false,
      isFull: false
    }
  ]
  gameService: GameService

  constructor(
    gameService: GameService
  ) { 
    this.gameService = gameService
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
      })
    }
  }

  ngOnInit(): void {
  }

  joinGame(gameName: string): void {
    this.gameService.currentGame = gameName
  }

}
