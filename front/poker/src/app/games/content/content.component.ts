import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'games-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class GamesContentComponent implements OnInit, OnChanges {
  @Input() username: string = ''
  @Input() doShow : EventEmitter<boolean> | null = null;

  showContent: boolean = false;
  gameService: GameService;
  currentView: string = 'list';

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

  selectView(view: string): void {
    this.currentView = view
  }
}
