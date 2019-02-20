class Rooms {
	constructor(){
		this.rooms = new Set();
		this.getRoom = this.getRoom.bind(this);
	}

	addRoom(room){
		this.rooms.add(room);
	}

	getRoom(roomID){
		return Array
			.from(this.rooms)
			.find(room => room.roomID === roomID);
	}

	deleteRoom(roomID){
		const room = this.getRoom(roomID);

		if (room) {
			return this.rooms.delete(room);
		}
		return false;
	}

	get roomsOnline(){
		return this.rooms.size;
	}
}

module.exports = Rooms;