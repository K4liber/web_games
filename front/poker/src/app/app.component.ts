import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLogged: boolean = false;
  username: string = '';

  constructor() {
   
  }

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
}
