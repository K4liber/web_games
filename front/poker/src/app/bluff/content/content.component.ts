import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';
import { getTimeNowString } from 'src/app/common';

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

    .card>img {
      max-width: 15vw;
    }

    .room-info {
      min-height: 24px;
    }

    .main-info {
      background-color: rgb(211,211,211);
      font-size: 1.2em;
      min-height: 80px;
      text-align: center;
    }
    `,
    `
    .hand-title {
      font-size: 1.2em;
      text-align: center;
    }
    `,
    `
    .modal {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 10;
      pointer-events: none;
      height: 100%;
      overflow-y: auto;
      overflow-x: auto;
      pointer-events: all;
    }
    `,
    `
    .relative {
      position: relative;
    }
    `,
    `
    .align-right {
      text-align: right;
    }
    `,
    `
    .close-modal-button {
      pointer-events: all;
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
  hand: [string, string][] = []
  possibleGuesses: string[] | null = null
  selectedSequence: string = ''
  progress: string[] = []
  players: string[] = []
  currentUsername: string | null = null
  untilMyTurn: number = -1
  isModalOpen: boolean = false
  playersCards: [string, [string, string][]][] = []
  lastGuessMsg: string = ''
  lastProgressClass: string = 'last-info'
  secondsLeft: number = 0
  timerInterval: ReturnType<typeof setInterval> | null = null;
  autoTurnTriggered: boolean = false

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
    this.socket.on('hand', (hand: [string, string][]) => {
      this.hand = hand
    })
    this.socket.on('possible_guesses', (possibleGuesses: [string[], boolean]) => {
      this.possibleGuesses = possibleGuesses[0]
      this.isStart = possibleGuesses[1]

      if (this.possibleGuesses !== null) {
        this.untilMyTurn = 0
        this.startTimer()
        this.myTurn.emit(true)
      }

      this.selectedSequence = ''
      this.changeDetectorRef.detectChanges()
    })
    this.socket.on('current_player', (data: [string, number]) => {
      this.isStart = false
      this.currentUsername = data[0]
      this.untilMyTurn = data[1]
      this.changeDetectorRef.detectChanges()
    })
    this.socket.on('progress', (progress: string) => {
      if (progress.includes('guess')) {
        this.lastGuessMsg = progress
      }

      this.addToProgress(progress)
    })
    this.socket.on('player_disconnected', (username: string) => {
      this.addToProgress("[" + username + "] exited the game.")
    })
    this.socket.on('finished', () => {
      this.isPlayerReady = false
      this.isGameReady = false
      this.possibleGuesses = null
      this.hand = []
      this.isModalOpen = false
      this.changeDetectorRef.detectChanges()
    })
    this.socket.on('players_cards', (data: [string, [string, string][]][]) => {
      this.playersCards = data
      this.isModalOpen = true
    })
  }

  startTimer() {
    this.clearInterval()
    this.autoTurnTriggered = false
    this.secondsLeft = 120
    this.timerInterval = setInterval(
      () => {
        this.secondsLeft -= 1

        if (this.secondsLeft === 0) {
          this.autoTurnTriggered = true

          if (this.isStart && this.possibleGuesses) {
            if (this.selectedSequence == '') {
              this.selectedSequence = this.possibleGuesses[0]
            }
            
            this.onSelect()
          } else {
            this.onCheck()
          }
        }
      }, 1000
    )
  }

  addToProgress(message: string) {
    let messageWithTimestamp = "(" + getTimeNowString() + ") " + message
    this.progress.unshift(messageWithTimestamp)
    this.lastProgressClass = 'last-info'
    this.changeDetectorRef.detectChanges()
    setTimeout(
      () => {
        this.lastProgressClass = 'normal-info'
        this.changeDetectorRef.detectChanges()
      }, 1000
    )
  }

  stopGame() {
    this.isModalOpen = false;
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

  getCardImageSrc(card: [string, string]): string {
    return "/assets/img/cards/" + card[0] + "_of_" + card[1] + ".png";
  }

  clearInterval() {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  onSelect() {
    this.clearInterval()
    this.socket.emit('selected', this.selectedSequence)
    this.possibleGuesses = null
    this.myTurn.emit(false)
    this.changeDetectorRef.detectChanges()
  }
  
  onCheck() {
    this.clearInterval()
    this.socket.emit('selected', 'check')
    this.possibleGuesses = null
    this.myTurn.emit(false)
    this.changeDetectorRef.detectChanges()
  }

  get leftPlayersString(): string {
    return this.untilMyTurn > 1 ? (this.untilMyTurn + ' players left for your turn!') : 'You are next!'
  }

  closeModal() {
    this.isModalOpen = false
    this.changeDetectorRef.detectChanges()
  }
}
