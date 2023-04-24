import { Component, OnInit } from '@angular/core';
import { SocketService } from '../app-socket.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    `
    .login-div {
      background-color: rgba(192, 192, 192);
      text-align: right;
      height: 35px;
      max-width: Min(96vw, 900px);
    }
    `,
    `
    .inline {
      display: inline-block;
    }
    `
  ]
})
export class LoginComponent implements OnInit {
  gameService: GameService
  username: string = ''

  constructor(
    private socket: SocketService,
    gameService: GameService
  ) {
    this.gameService = gameService
  }

  ngOnInit(): void {
    this.socket.on('connect', () => {
      console.log('connected')
    })
    this.socket.on('disconnect', () => {
      this.onDisconnect()
    })
  }

  onDisconnect() {
    this.gameService.setUsername(null);
  }

  login() {
    let username = this.username.trim()

    if (username.length < 2) {
      alert("Username should contain at least 2 signs!");
      return;
    }

    this.gameService.setUsername(username)
    this.socket.connect();
    this.socket.emit('username', username)
  }

  logout() {
    this.gameService.setUsername(null);
    this.gameService.setGame(null)
    this.socket.disconnect()
  }

}
