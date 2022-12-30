import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
    `
  ]
})
export class ContentComponent implements OnInit {
  
  @Input() username: string = ''

  isGameReady: boolean = false;
  isStart: boolean = false;
  isPlayerReady: boolean = false;
  hand: string[][] = []
  possibleGuesses: string[] | null = null
  selectedSequence: string = ''
  progress: string[] = []

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private socket: SocketService
  ) { }

  ngOnInit(): void {
    this.socket.on('bluff_ready', (isReady: boolean) => {
      this.onBluffReady(isReady)
    })
    this.socket.on('error', (errorMessage: string) => {
      this.onError(errorMessage)
    })
    this.socket.on('hand', (hand: string[][]) => {
      this.hand = hand
    })
    this.socket.on('possible_guesses', (possibleGuesses: [string[], boolean]) => {
      this.possibleGuesses = possibleGuesses[0]
      this.isStart = possibleGuesses[1]
      this.changeDetectorRef.detectChanges()
    })
    this.socket.on('progress', (progress: string) => {
      this.progress.push(progress)
    })
    this.socket.on('finished', () => {
      this.isPlayerReady = false
      this.isGameReady = false
      this.possibleGuesses = null
      this.hand = []
    })
  }

  onError(errorMessage: string) {
    alert(errorMessage)
  }

  onBluffReady(isReady: boolean) {
    this.isGameReady = isReady
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
    this.changeDetectorRef.detectChanges()
  }
  
  onCheck() {
    this.socket.emit('selected', 'check')
    this.possibleGuesses = null
    this.changeDetectorRef.detectChanges()
  }
}
