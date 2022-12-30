import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    url: 'http://127.0.0.1:8000', 
    options: {
        autoConnect: false
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
