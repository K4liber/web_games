import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  currentGame: string | null = null
  username: string | null = null
  
  constructor() { 

  }
}
