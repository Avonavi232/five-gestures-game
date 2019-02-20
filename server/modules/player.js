const uuid = require('uuid');

class Player {
    constructor(socket) {
        this.playerID = uuid.v4();
        this.socket = socket;
        this.roomID = null;

        this.status = 'online';

        this.statistics = {
            wins: 0,
            losses: 0,
        };

        this.gesture = '';

        this.listen = this.listen.bind(this);
        this._joinRoom = this._joinRoom.bind(this);
    }

    _joinRoom(roomID){
        this.roomID = roomID;
        this.socket.join(this.roomID);
    }

    listen(event, callback) {
        this.socket.on(event, callback.bind(this));
    }

    notify(event, ...args) {
        this.socket.emit(event, ...args);
    }

    broadcast(event, ...args){
        this.socket.broadcast.emit(event, ...args);
    }
}

module.exports = Player;