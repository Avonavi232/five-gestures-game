const EventListener = require('./eventListener');

class Rooms extends EventListener{
	constructor(){
		super();
		this.rooms = new Set();
		this.getRoom = this.getRoom.bind(this);
	}

	addRoom(room){
		this.rooms.add(room);
		room.destroyRoom = this.deleteRoom.bind(this);
		room.roomsContainer = this;

		// console.log('rooms:');
		// console.log(Array.from(this.rooms).map(el => el.roomID));
		// console.log('\n');
	}

    /**
     * @param roomID {string}
     * @returns Room instance
     */
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