const
		app = require('express')(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		uuid = require('uuid'),
		PORT = process.env.PORT || 5000,
		Rooms = require('./modules/rooms'),
		Room = require('./modules/room');


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

	// for (const playerID in players) {
	// 	if (players[playerID].status !== 'online')
	// 		return false
	// }

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


io.on('connection', socket => {
	global.online++;
	console.log('\nSomeone Connected');


	socket.on('forceDisconnect', () => {
		socket.disconnect();
	});

	socket.on('disconnect', () => {
		console.log('Disconnect occured');
		if (socket.roomID && socket.playerID) {
			const room = global.rooms[socket.roomID];
			if (Object.keys(room.players).length === 1 && room.players[socket.playerID]) {
				delete global.rooms[socket.roomID];
			} else if (Object.keys(room.players).length > 1 &&
					room.players[socket.playerID] &&
					room.players[socket.playerID].status === 'online') {
				room.players[socket.playerID].status = 'offline';
			}
		}
	});

	/*
	* Если активный игрок дисконнектнулся, то поставим ему статус offline*/
	socket.on('player_disconnected', ({roomID, playerID}) => {
		if (!roomID || !playerID) {
			return;
		}
		if (!global.rooms[roomID] || !global.rooms[roomID].players) {
			return;
		}

		global.rooms[roomID].players[playerID].status = 'offline';
	});


	/*
	* Комната создается пользователем playerID, с переданными настройками
	* 1. Создается roomID и в объект rooms добавляется объект комнаты
	* socket присоединяется к этой комнате
	* 2. всем отправляется событие 'roomEntered' с параметрами roomID, playerID, настройки комнаты
	*
	* */
	socket.on('createNewRoom', ({playerID, maxScore = 3, chatEnable = true}) => {
		if (!playerID) {
			socket.emit('myError', new Error('no playerID passed'));
			return;
		}

		const roomID = uuid.v4();
		socket.roomID = roomID;
		socket.playerID = playerID;

		socket.join(roomID, () => {
			// console.log('\nCreate new Room');

			if (!Object.values(socket.rooms).includes(roomID)) {
				return;
			}

			global.rooms[roomID] = {
				players: {
					[playerID]: {
						gesture: '',
						wins: 0,
						losses: 0,
						status: 'online'
					}
				},
				maxScore,
				chatEnable,
				matchesPlayed: 0
			};

			io.to(roomID).emit('roomEntered', {
				roomID,
				playerID,
				settings: {
					chatEnable: global.rooms[roomID].chatEnable,
					maxScore: global.rooms[roomID].maxScore
				}
			});
		});
	});


	/*Постучаться в существующую комнату
	* Если комната с roomID существует, и playerID в ней еще нет,
	* то playerID зайдет в комнату
	* если в комнате достаточное количество игроков (сейчас 2), то происходит
	* emit события startGame
	* */
	socket.on('knockToRoom', ({roomID, playerID}) => {
		if (!playerID) {
			socket.emit('myError', new Error('no playerID passed'));
			return;
		}


		if (global.rooms[roomID] === undefined) {
			socket.emit('myError', new Error('non-existing-room'));
			return;
		}

		socket.roomID = roomID;
		socket.playerID = playerID;

		if (global.rooms[roomID].players[playerID] !== undefined &&
				global.rooms[roomID].players[playerID].status === 'online') {
			/*Для простоты примем, что если в комнате с ID, в которую стучатся, уже есть игрок
			* , которы стучится, то значит - это он вылетел и заходит заново.
			* Но нужно проверить статус online*/
			// console.log('knockToRoom: игрок с таким ID уже есть в комнате');
			socket.emit('myError', new Error('User already online in the room'));
			return;
		}


		socket.join(roomID, () => {
			if (global.rooms[roomID].players[playerID] !== undefined &&
					global.rooms[roomID].players[playerID].status === 'offline') {

				global.rooms[roomID].players[playerID].status = 'online'

			} else {
				global.rooms[roomID].players[playerID] = {
					gesture: '',
					wins: 0,
					losses: 0,
					status: 'online'
				};
			}


			if (checkReadyToPlay(global.rooms[roomID].players)) {
				io.to(roomID).emit('startGame');
			}

			// console.log('\nKnocking new Room');
			io.to(roomID).emit('roomEntered', {
				roomID,
				playerID,
				settings: {
					chatEnable: global.rooms[roomID].chatEnable,
					maxScore: global.rooms[roomID].maxScore
				}
			});
		});

	});


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

			socket.broadcast.emit('message', {
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



const rooms = new Rooms();

const
		room1 = new Room(),
		room2 = new Room();

rooms.addRoom(room1);
rooms.addRoom(room2);

console.log(rooms.roomsOnline);

























