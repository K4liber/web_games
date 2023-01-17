import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

const options = environment.production ? {
    autoConnect: false,
    path: '/websocket/socket.io'
} : {
    autoConnect: false,
}

const config: SocketIoConfig = { 
    url: environment.API_URL, 
    options: options
};

@Injectable({
    providedIn: 'root'
})
export class SocketService extends Socket {

    constructor() {
        super(config)
    }
}
