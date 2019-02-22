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
    constructor(io, settings) {
        super();
        this.roomID = uuid.v4();
        this.players = new Set();
        this.io = io;
        this.settings = settings;

        this.destroyRoom = Function.prototype;
        this.subcribeForPlayer = this.subcribeForPlayer.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.sendToRoom = this.sendToRoom.bind(this);
    }

    addPlayer(player) {
        this.players.add(player);
    }

    subcribeForPlayer(player) {
        player.emitToRoom = this.emit;

        this.subscribe('sendToRoom', this.sendToRoom);

        this.subscribe('enterRoom', (player, cb) => {
            this.addPlayer(player);
            cb(this.roomID);
        });

        this.subscribe('playerDisconnected', playerID => this.handlePlayerDisconnect(playerID));

        this.subscribe('makeMove', player => this.handlePlayerMadeMove(player))
    }

    isReadyToPlay() {
        return this.players.size === 2;
    }

    allMadeMoves() {
        for (const player of this.players) {
            if (!player.didMove()) {
                return false
            }
        }

        return true;
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

    handlePlayerDisconnect(player) {
        if (this.players.size === 1) {
            this.destroyRoom(this.roomID);
        } else {
            player.status = 'offline';
        }
    }

    handlePlayerMadeMove(player) {
        if (this.allMadeMoves()) {

        }
    }

    //TODO update algorythm for more than couple of players
    evaluateMatchResult() {
        const players = Array
            .from(this.players)
            .map(player => ({id: player.playerID, gesture: player.gesture}));

        if (players[0].gesture === players[1].gesture) {
            return false;
        } else if (
            gesturesTable[players[0].gesture]
            && gesturesTable[players[0].gesture].includes(players[1].gesture)
        ) {
            return players[0].id;
        } else {
            return players[1].id;
        }
    }
}

module.exports = Room;