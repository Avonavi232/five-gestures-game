const
		app = require('express')(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		uuid = require('uuid'),
		PORT = process.env.PORT || 5000,
		Rooms = require('./modules/rooms'),
		Room = require('./modules/room'),
		Player = require('./modules/player');


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

global.online = 0;
global.rooms = {};

const gesturesTable = {
	scissors: ['paper', 'lizard'],
	rock: ['scissors', 'lizard'],
	paper: ['rock', 'spock'],
	spock: ['rock', 'scissors'],
	lizard: ['spock', 'paper']
};

function evaluateMatchResult(players, gesturesTable) {
	if (!players || !gesturesTable) return;

	for (const name in players) {
		if (!players[name].gesture) return;
	}

	const names = Object.keys(players);

	if (players[names[0]].gesture === players[names[1]].gesture) {
		return false;
	} else if (gesturesTable[players[names[0]].gesture].includes(players[names[1]].gesture)) {
		players[names[0]].wins += 1; //todo что за wins ?
		return names[0];
	} else {
		players[names[1]].wins += 1;
		return names[1];
	}
}

function evaluateGameResult(players) {
	if (!players) return;

	const IDs = Object.keys(players);

	if (players[IDs[0]].wins === players[IDs[1]].wins) {
		return false
	} else if (players[IDs[0]].wins > players[IDs[1]].wins) {
		return IDs[0]
	} else {
		return IDs[1];
	}
}

function checkReadyToPlay(players) {
	if (!players) return;


	if (Object.keys(players).length < 2) //сейчас в комнате может быть только 2 игрока
		return false;
	return true;
}

function checkPlayersDidTurns(players) {
	if (!players) return;

	let result = true;

	for (const id in players) {
		if (!players[id].gesture) {
			result = false;
			break;
		}
	}

	return result;
}


const roomsContainer = new Rooms();

io.on('connection', socket => {
	const player = new Player(socket);
	player.sendToMe('playerCreated', {playerID: player.playerID});


	player.listen('createNewRoom', function (settings) {
		player._log('Create new Room');

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
			player.sendToRoom('startGame');
		}
	});


	['forceDisconnect', 'disconnect']
			.forEach(e => player.listen(e, player.disconnect));


	/*
	* Если активный игрок дисконнектнулся, то поставим ему статус offline*/
	// socket.on('player_disconnected', ({roomID, playerID}) => {
	//     if (!roomID || !playerID) {
	//         return;
	//     }
	//     if (!global.rooms[roomID] || !global.rooms[roomID].players) {
	//         return;
	//     }
	//
	//     global.rooms[roomID].players[playerID].status = 'offline';
	// });



	/*Основной игровой цикл происходит, когда игрок делает ход
	* */
	socket.on('playerDidTurn', ({roomID, playerID, gesture}) => {
		console.log('\nGesture received');

		//Проверим, не сделан ли уже ход данным игроком. Если не сделан, то делаем ход.
		if (!global.rooms[roomID].players[playerID].gesture) {
			global.rooms[roomID].players[playerID].gesture = gesture;

			/*Отправим события сделавшему ход игроку и оппоненту*/
			socket.emit('message', {
				type: 'playerDidTurn',
				gesture
			});

			socket.sendToRoom.emit('message', {
				type: 'opponentDidTurn',
				gesture,
				playerID
			});
		}

		//Проверим, оба игрока уже сделали ход? Если да, то вычислим итог
		if (checkPlayersDidTurns(global.rooms[roomID].players)) {

			const winnerID = evaluateMatchResult(global.rooms[roomID].players, gesturesTable);
			console.log('\nMatch end');
			console.log(`${winnerID} wins`);
			io.to(roomID).emit('matchResult', winnerID);


			//Обнулим отправленные в раунде жесты игроков
			for (const id in global.rooms[roomID].players) {
				global.rooms[roomID].players[id].gesture = '';
			}


			/*Если кто то из игроков победил, то увеличим счетчик сыгранных матчей*/
			if (winnerID) {
				global.rooms[roomID].matchesPlayed += 1;
			}


			//Если игра закончена, то отправим результат игры
			if (global.rooms[roomID].matchesPlayed === global.rooms[roomID].maxScore) {
				const winnerID = evaluateGameResult(global.rooms[roomID].players);
				io.to(roomID).emit('gameResult', winnerID);
				console.log('\nGame end');
				if (winnerID) {
					console.log(`${winnerID} wins`);
				} else {
					console.log('Ничья')
				}
			}
		}
	});


	/*Чатик*/
	socket.on('chatMessage', ({message}) => {
		console.log('chat message received');
		io.to(socket.roomID).emit('chatMessage', {
			message,
			playerID: socket.playerID
		});
	});

	/*TEST*/
	socket.on('test', (e) => {
		socket.emit('test', 'Hello')
	});
});


const listen = function () {
	http.listen.apply(http, arguments);
};

const close = function (callback) {
	http.close(callback);
};

listen(PORT);

module.exports = {
	gesturesTable,
	evaluateMatchResult,
	evaluateGameResult,
	checkReadyToPlay,
	checkPlayersDidTurns,
	listen,
	close,
	rooms: global.rooms
};


// const rooms = new Rooms();
//
// const
//     room1 = new Room(),
//     room2 = new Room();
//
// rooms.addRoom(room1);
// rooms.addRoom(room2);
//
// console.log(rooms.roomsOnline);

























