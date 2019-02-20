const uuid = require('uuid');

class Room {
	constructor(io, settings){
		this.roomID = uuid.v4();
		this.players = new Set();
		this.io = io;
		this.settings = settings;
	}

	addPlayer(player){
		this.players.add(player);
		player._joinRoom(this.roomID);
	}

	deletePlayer(playerID){
		const found = Array
			.from(this.players)
			.find(player => player.playerID === playerID);
		if (found) {
			return this.players.delete(found);
		}
		return false;
	}

	broadcast(event, ...args){
		this.io.to(this.roomID).emit(event, ...args);
	}
}

module.exports = Room;