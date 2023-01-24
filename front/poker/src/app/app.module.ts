import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { BluffModule } from './bluff/bluff.module';
import { SocketService } from './app-socket.service';
import { GameComponent } from './game/game.component';
import { QuantumComponent } from './quantum/quantum.component';
import { HomeComponent } from './home/home.component';
import { NgChartsModule } from 'ng2-charts';


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
