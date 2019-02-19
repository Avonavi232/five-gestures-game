const uuid = require('uuid');

class Room {
	constructor(){
		this.roomID = uuid.v4();
	}
}

module.exports = Room;