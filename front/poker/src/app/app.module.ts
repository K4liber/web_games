import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { SocketService } from './app-socket.service';
import { AppComponent } from './app.component';
import { BluffModule } from './bluff/bluff.module';
import { ChatModule } from './chat/chat.module';
import { GameComponent } from './game/game.component';
import { GamesModule } from './games/games.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { QuantumComponent } from './quantum/quantum.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GameComponent,
    QuantumComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GamesModule,
    ChatModule,
    FormsModule,
    BluffModule,
    NgChartsModule
  ],
  providers: [
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
