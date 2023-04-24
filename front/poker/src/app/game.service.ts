import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentGame: string | null = null
  private username: string | null = null
  players: EventEmitter<string[]> = new EventEmitter<string[]>();
  usernameChange: EventEmitter<string | null> 
    = new EventEmitter<string | null>();
  gameChange: EventEmitter<string | null> 
    = new EventEmitter<string | null>();

  constructor() { 

  }

  setUsername(username: string | null) {
    this.username = username
    this.usernameChange.emit(username)
  }

  getUsername(): string | null {
    return this.username
  }

  setGame(game: string | null) {
    this.currentGame = game
    this.gameChange.emit(game)
  }

  getCurrentGame(): string | null {
    return this.currentGame
  }
}
