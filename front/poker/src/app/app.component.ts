import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLogged: boolean = false;
  username: string = '';

  constructor(private titleService: Title) {}

  ngOnInit() {
    document.body.className = "main";
  }

  usernameChanged(username: string) {
    if (username.trim() === '') {
      this.isLogged = false;
    } else {
      this.isLogged = true;
    }
    
    this.username = username
  }

  myTurn(isMyTurn: boolean) {
    if (isMyTurn) {
      this.titleService.setTitle('* Poker')
    } else {
      this.titleService.setTitle('Poker')
    }
  }
}
