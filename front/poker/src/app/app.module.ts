import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { BluffModule } from './bluff/bluff.module';

const config: SocketIoConfig = { 
  url: 'http://127.0.0.1:8000', 
  options: {
    autoConnect: false
  } 
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    ChatModule,
    FormsModule,
    BluffModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
