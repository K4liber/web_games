import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    url: 'localhost:8000', // 'http://31.178.189.125:80', 
    options: {
        autoConnect: false,
        //path: '/websocket/socket.io'
    } 
};

@Injectable({
    providedIn: 'root'
})
export class SocketService extends Socket {

    constructor() {
        super(config)
    }
}
