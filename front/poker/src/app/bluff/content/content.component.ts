import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';

@Component({
  selector: 'bluff-content',
  templateUrl: './content.component.html',
  styles: [
    `
    .hand {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    `,
    `
    .card {
      padding: 5px;
    }

    .main-info {
      background-color: rgb(211,211,211);
      font-size: 1.2em;
      min-height: 70px;
      text-align: center;
    }

    .last-info {
      font-weight: bold;
      font-color: white;
      border: 1px solid;
    }

    .normal-info {
      color: rgb(50, 50, 50);
    }
    `,
    `
    .hand-title {
      font-size: 1.2em;
      text-align: center;
    }
    `
  ]
})
export class ContentComponent implements OnInit {
  
  @Input() username: string = ''
  @Output() myTurn = new EventEmitter<boolean>();

  isGameReady: boolean = false;
  isStart: boolean = false;
  isPlayerReady: boolean = false;
  hand: string[][] = []
  possibleGuesses: string[] | null = null
  selectedSequence: string = ''
  progress: string[] = []
  players: string[] = []

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private socket: SocketService
  ) { }

  ngOnInit(): void {
    this.socket.on('ready_players', (players: string[]) => {
      this.onReadyPlayers(players)
    })
    this.socket.on('error', (errorMessage: string) => {
      this.onError(errorMessage)
    })
    this.socket.on('hand', (hand: string[][]) => {
      this.hand = hand
    })
    this.socket.on('possible_guesses', (possibleGuesses: [string[], boolean]) => {
      this.possibleGuesses = possibleGuesses[0]

      if (this.possibleGuesses !== null) {
        this.myTurn.emit(true)
      }

      this.isStart = possibleGuesses[1]
      this.changeDetectorRef.detectChanges()
    })
    this.socket.on('progress', (progress: string) => {
      this.progress.unshift(progress)
    })
    this.socket.on('finished', () => {
      this.isPlayerReady = false
      this.isGameReady = false
      this.possibleGuesses = null
      this.hand = []
    })
  }

  stopGame() {
    this.isGameReady = false;
    this.isStart = false;
    this.isPlayerReady = false;
    this.hand = []
    this.possibleGuesses = null
    this.selectedSequence = ''
    this.progress = []
    this.players = []
    this.myTurn.emit(false)
  }

  onError(errorMessage: string) {
    alert(errorMessage)
  }

  onReadyPlayers(players: string[]) {
    console.log(players)

    if (players.length === 0) {
      this.stopGame()
    } else {
      this.isGameReady = players.length >= 2
      this.players = players
    }
    
    this.changeDetectorRef.detectChanges()
  }

  play() {
    this.progress = []
    this.socket.emit('ready_for_bluff', this.username)
    this.isPlayerReady = true
  }

  start() {
    this.socket.emit('start_bluff')
  }

  getCardImageSrc(card: string[]): string {
    return "/assets/img/cards/" + card[0] + "_of_" + card[1] + ".png";
  }

  onSelect() {
    this.socket.emit('selected', this.selectedSequence)
    this.possibleGuesses = null
    this.myTurn.emit(false)
    this.changeDetectorRef.detectChanges()
  }
  
  onCheck() {
    this.socket.emit('selected', 'check')
    this.possibleGuesses = null
    this.myTurn.emit(false)
    this.changeDetectorRef.detectChanges()
  }
}
