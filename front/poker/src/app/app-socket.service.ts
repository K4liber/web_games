import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    url: 'http://31.178.189.125:80', 
    options: {
        autoConnect: false,
        path: '/websocket/socket.io'
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
