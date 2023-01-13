import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SocketService } from 'src/app/app-socket.service';
import { getCardImageSrc } from 'src/app/common';

@Component({
  selector: 'app-last-settlement',
  templateUrl: './last-settlement.component.html',
  styleUrls: ['./last-settlement.component.scss']
})
export class LastSettlementComponent implements OnInit, OnChanges {

  @Input() doShow : EventEmitter<boolean> | null = null;
  @Output() myTurn = new EventEmitter<boolean>();

  showContent: boolean = false;
  summary: string = ''
  playersCards: [string, [string, string][]][] = []
  getCardImageSrc = getCardImageSrc
  
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private socket: SocketService
  ) { }
  
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
    this.socket.on('summary', (summary: string) => {
      this.summary = summary
    })
    this.socket.on('players_cards', (data: [string, [string, string][]][]) => {
      this.playersCards = data
    })
  }

}
