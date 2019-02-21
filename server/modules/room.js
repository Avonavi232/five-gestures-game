const uuid = require('uuid');

class EventListener {
	constructor() {
		this.events = {};

		this.emit = this.emit.bind(this);
	}

	subscribe(event, callback) {
		if (!this.events[event]) {
			this.events[event] = new Set();
		}
		this.events[event].add(callback);
		return () => this.events[event].delete(callback);
	}

	emit(event, ...args) {
		this.events[event].forEach(cb => cb(...args));
	}
}

class Room extends EventListener {
	constructor(io, settings) {
		super();
		this.roomID = uuid.v4();
		this.players = new Set();
		this.io = io;
		this.settings = settings;

		this.subcribeForPlayer = this.subcribeForPlayer.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.sendToRoom = this.sendToRoom.bind(this);
	}

	addPlayer(player) {
		this.players.add(player);
	}

	subcribeForPlayer(player){
		player.emitToRoom = this.emit;

		this.subscribe('sendToRoom', this.sendToRoom);

		this.subscribe('enterRoom', (player, cb) => {
			this.addPlayer(player);
			cb(this.roomID);
		});

		this.subscribe('playerDisconnected', playerID => this.handlePlayerDisconnect(playerID));
	}

	isReadyToPlay() {
		return this.players.size === 2;
	}

	deletePlayer(playerID) {
		const found = Array
				.from(this.players)
				.find(player => player.playerID === playerID);
		if (found) {
			return this.players.delete(found);
		}
		return false;
	}

	sendToRoom(event, ...args) {
		this.io.to(this.roomID).emit(event, ...args);
	}

	handlePlayerDisconnect(player){
		if (this.players.size === 1) {
			this.destroyRoom();
		} else {
			player.status = 'offline';
		}
		this.players.forEach(player => console.log(player.status));
	}

	destroyRoom(){
		console.log('Destroy room');
	}
}

module.exports = Room;