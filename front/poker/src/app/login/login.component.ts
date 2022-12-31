import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketService } from '../app-socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    `
    .main {
      background-color: grey;
    }

    .element {
      margin: 5px;
    }
    `
  ]
})
export class LoginComponent implements OnInit {
  username: string = ''
  isLogged: boolean = false;

  @Output() usernameChanged = new EventEmitter<string>();
  
  constructor(
    private socket: SocketService
  ) {

  }

  ngOnInit(): void {
    this.socket.on('connect', () => {
      this.onConnect()
    })
    this.socket.on('disconnect', () => {
      this.onDisconnect()
    })
  }

  onDisconnect() {
    this.isLogged = false;
    this.username = '';
    this.usernameChanged.emit(this.username)
  }

  onConnect() {
    this.socket.emit('notify', this.username + " joined!"); 
    this.isLogged = true;
    this.usernameChanged.emit(this.username)
  }

  login() {
    if (this.username.trim().length > 1){
        this.socket.connect();
        this.socket.emit('username', this.username)
    } else {
        alert("Username should contain at least 2 signs!");
    }
  }

  logout() {
    this.socket.disconnect()
  }

}
