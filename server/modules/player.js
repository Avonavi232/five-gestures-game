const uuid = require('uuid');

class Player {
	constructor(socket) {
		this.playerID = uuid.v4();
		this.socket = socket;
		this.roomID = null;

		this.status = 'offline';

		this.statistics = {
			wins: 0
		};

		this.gesture = '';

		this.emitToRoom = Function.prototype;

		this.listen = this.listen.bind(this);
		this._log = this._log.bind(this);
	}

	setSocket(socket, roomID){
		this.socket = socket;

		if (!roomID) {
		    return Promise.resolve();
        } else {
            return new Promise(resolve => {
                this.socket.join(roomID, () => resolve());
            })
        }
	}

	listen(event, callback) {
		this.socket.on(event, callback.bind(this));
	}

	sendToMe(event, ...args) {
		this.socket.emit(event, ...args);
	}

	sendToRoomExceptMe(event, ...args){
		this.socket.broadcast.emit(event, args);
	}

	sendToRoom(event, ...args) {
		this.emitToRoom('sendToRoom', event, ...args);
	}

	disconnect() {
		this.emitToRoom('playerDisconnected', this);
	}

	enterRoom() {
	    return new Promise(resolve => {
            this.emitToRoom('enterRoom', this, roomID => {
                this.roomID = roomID;
                this.socket.join(roomID, () => resolve());
            });
        });
	}

	_log(...args){
		this.sendToMe('chatMessage', ...args);
	}

	didMove(){
		return !!this.gesture;
	}

	doMove(gesture){
		this.gesture = gesture;
		this.sendToMe('playerDidTurn'); //TODO rename
		this.sendToRoom('opponentDidTurn', gesture); //TODO rename
		this.emitToRoom('makeMove', this, gesture);
	}

	_resetGesture(){
		this.gesture = '';
	}

	_resetStatistics(){
		this.statistics = {
			wins: 0
		}
	}

	get stat(){
		return this.statistics;
	}

	destroy(){
		console.log('player destroyed'); //TODO
	}
}

module.exports = Player;