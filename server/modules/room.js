const
	uuid = require('uuid'),
	EventListener = require('./eventListener'),
	gesturesTable = {
		scissors: ['paper', 'lizard'],
		rock: ['scissors', 'lizard'],
		paper: ['rock', 'spock'],
		spock: ['rock', 'scissors'],
		lizard: ['spock', 'paper']
	};

class Room extends EventListener {
	constructor(io, settings = {}) {
		super();

		const defaultSetting = {
			maxScore: 3,
			chatEnabled: true
		};

		this.roomID = uuid.v4();
		this.players = new Set();
		this.io = io;
		this.settings = Object.assign({}, defaultSetting, settings);

		this.matchesPlayed = 0;

		this.destroyRoom = Function.prototype;

		this.subcribeForPlayer = this.subcribeForPlayer.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.sendToRoom = this.sendToRoom.bind(this);
		this._initSubscribtions = this._initSubscribtions.bind(this);

		this._initSubscribtions();
	}

	addPlayer(player) {
		this.players.add(player);
	}

	_initSubscribtions(){
		this.subscribe('sendToRoom', this.sendToRoom);

		this.subscribe('enterRoom', (player, cb) => {
			this.addPlayer(player);
			cb(this.roomID);
		});

		this.subscribe('playerDisconnected', player => this.handlePlayerDisconnect(player));

		this.subscribe('makeMove', player => this.handlePlayerMadeMove(player))
	}

	subcribeForPlayer(player) {
		player.emitToRoom = this.emit;
	}

	isReadyToPlay() {
		return this.players.size === 2;
	}

	isMatchOver() {
		for (const player of this.players) {
			if (!player.didMove()) {
				return false
			}
		}

		return true;
	}

	isGameOver() {
		return this.matchesPlayed >= this.settings.maxScore;
	}

	deletePlayer(playerID) {
		const player = this.getPlayer(playerID);

		if (player) {
			player.destroy();
			return this.players.delete(player);
		}

		return false;
	}

	getPlayer(playerID) {
		return Array
			.from(this.players)
			.find(player => player.playerID === playerID);
	}

	reconnectPlayer(player, oldPlayerID){
		const oldPlayer = this.getPlayer(oldPlayerID);
		this.deletePlayer(oldPlayerID);
		player.statistics = {...oldPlayer.statistics};
		player.playerID = oldPlayer.playerID;
		this.subcribeForPlayer(player);
		player.enterRoom(this);
	}

	sendToRoom(event, ...args) {
		this.io.to(this.roomID).emit(event, ...args);
	}

	startGame(){
		this.sendToRoom('startGame');
	}

	handlePlayerDisconnect(player) {
		// console.log(`Player disconnected: ${player.playerID}`);

		if (this.players.size === 1) {
			this.destroyRoom(this.roomID);
		} else {
			player.status = 'offline';
		}
	}

	handlePlayerMadeMove(player) {
		if (this.isMatchOver()) {

		}
	}

	//TODO update algorythm for more than couple of players
	getMatchResult() {
		const players = Array.from(this.players);

		if (players[0].gesture === players[1].gesture) {
			return false;
		}

		this.matchesPlayed += 1;

		if (
			gesturesTable[players[0].gesture]
			&& gesturesTable[players[0].gesture].includes(players[1].gesture)
		) {
			players[0].statistics.wins += 1;
			return players[0].playerID;
		} else {
			players[1].statistics.wins += 1;
			return players[1].playerID;
		}
	}


	getGameResult() {
		const
			players = Array.from(this.players),
			results = players
				.map(player => ({id: player.playerID, wins: player.stat.wins}))
				.sort((a, b) => b.wins - a.wins);

		return results[0].id;
	}


	prepareForMatch() {
		this.players.forEach(player => player._resetGesture());
	}
}

module.exports = Room;