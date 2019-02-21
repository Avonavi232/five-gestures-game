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

		this.emitToRoom = Function.prototype;

		this.listen = this.listen.bind(this);
		this._log = this._log.bind(this);
	}


	listen(event, callback) {
		this.socket.on(event, callback.bind(this));
	}

	sendToMe(event, ...args) {
		this.socket.emit(event, args);
	}

	sendToRoom(event, ...args) {
		this.emitToRoom('sendToRoom', event, ...args);
	}

	disconnect() {
		this.emitToRoom('playerDisconnected', this);
	}

	enterRoom() {
		this.emitToRoom('enterRoom', this, roomID => {
			this.roomID = roomID;
			this.socket.join(roomID);
		});
	}

	_log(...args){
		this.sendToMe('chatMessage', ...args);
	}
}

module.exports = Player;