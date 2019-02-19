class Rooms {
	constructor(){
		this.rooms = new Set();
	}

	addRoom(room){
		this.rooms.add(room);
	}

	deleteRoom(roomID){
		const found = Array
				.from(this.rooms)
				.find(room => room.roomID === roomID);
		if (found) {
			return this.rooms.delete(found);
		}
		return false;
	}

	get roomsOnline(){
		return this.rooms.size;
	}
}

module.exports = Rooms;