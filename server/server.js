const
	app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	PORT = process.env.PORT || 5000,
	Rooms = require('./modules/rooms'),
	Room = require('./modules/room'),
	Player = require('./modules/player');


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

const roomsContainer = new Rooms();

io.on('connection', socket => {
	let player = new Player(socket);
	// console.log(`Player created: ${player.playerID}`);


	player.listen('reconnectToRoom', ({playerID, roomID}) => {
		const room = roomsContainer.getRoom(roomID);
		if(room){
			room.reconnectPlayer(player, playerID);
		}
	});


	player.sendToMe('playerCreated', {playerID: player.playerID});


	player.listen('createNewRoom', function (settings) {
		const room = new Room(io, settings);
		roomsContainer.addRoom(room);

		room.subcribeForPlayer(player);
		player.enterRoom(room);

		player.sendToRoom('roomEntered', {roomID: room.roomID, playerID: player.playerID,});
	});


	player.listen('knockToRoom', function ({roomID}) {
		const room = roomsContainer.getRoom(roomID);
		room.subcribeForPlayer(player);
		player.enterRoom(room);

		player.sendToRoom('roomEntered', {roomID: room.roomID, playerID: player.playerID,});

		if (room.isReadyToPlay()) {
			room.startGame();
		}
	});


	['forceDisconnect', 'disconnect']
		.forEach(e => player.listen(e, player.disconnect));


	player.listen('makeMove', (gesture) => {
		const room = roomsContainer.getRoom(player.roomID);

		if (!player.didMove()) {
			player.doMove(gesture);
		}

		if (room.isMatchOver()) {
			const winner = room.getMatchResult();
			room.sendToRoom('matchResult', {win: winner});
			room.prepareForMatch();

			// room.players.forEach(player => {
			// 	console.log(`Player \n id ${player.playerID} \n wins ${player.statistics.wins} \n\n`);
			// })
		}

		if (room.isGameOver()) {
			const winner = room.getGameResult();
			room.sendToRoom('gameResult', {win: winner});
			room.prepareForMatch()
		}
	});

	/*Chat*/
	player.listen('chatMessage', (message) => {
		io.of(player.roomID).clients((error, clients) => {
			console.log(clients);
			// clients.forEach(function(client) {
			// 	console.log('Username: ' + client.playerID);
			// });
		});
		//
		// roster.forEach(function(client) {
		// 	console.log('Username: ' + client.playerID);
		// });

		player.sendToRoom('chatMessage', `${message} from ${player.playerID}`);
	});
});


const listen = function () {
	http.listen.apply(http, arguments);
};

const close = function (callback) {
	http.close(callback);
};

listen(PORT);


// module.exports = {
//     evaluateMatchResult,
//     evaluateGameResult,
//     checkReadyToPlay,
//     checkPlayersDidTurns,
//     listen,
//     close,
//     rooms: global.rooms
// };




















