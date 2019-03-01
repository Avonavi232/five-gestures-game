import React, {Component} from 'react';
import io from 'socket.io-client';

class TestApp extends Component {
	constructor(props) {
		super(props);
		this.apiUrl = 'http://localhost:5000';
	}


	componentDidMount() {
		this.client1 = io.connect(this.apiUrl);
		this.client2 = io.connect(this.apiUrl);
		this.clients = [this.client1, this.client2];

		const playMatch = (gesture1, gesture2, player1, player2) => {
			return new Promise(resolve => {
				player1.once('matchResult', ({win}) => {
					const found = [player1, player2]
						.find(el => el.playerID === win);

					if (found) {
						console.log(`Match wins the ${found.name}`);
					} else {
						console.log(`Ничья`);
					}
					resolve();
				});
				player1.emit('makeMove', gesture1);
				player2.emit('makeMove', gesture2);
			})
		};

		const playerReconnect = (oldPlayer) => {
			return new Promise(resolve => {
				let
					oldPlayer1Id = oldPlayer.playerID,
					oldRoomId = oldPlayer.roomID;

				setTimeout(() => {
					oldPlayer.close()
				}, 500);

				setTimeout(() => {
					const player = io.connect(this.apiUrl);
					player.playerID = oldPlayer1Id;
					player.roomID = oldRoomId;
					player.name = 'Player1';

					player.on('chatMessage', data => console.log(`Player1 hears: ${data}`));
					player.emit('reconnectToRoom', {
						playerID: oldPlayer1Id,
						roomID: oldRoomId
					});
					resolve(player);
				}, 1000);
			})
		};

		this.client1.name = 'player1';
		this.client2.name = 'player2';

		this.client1.on('startGame', () => console.log('game started'));
		this.client1.on('roomEntered', () => console.log('room entered'));

		this.client1.on('chatMessage', data => console.log(`Player1 hears: ${data}`));
		this.client2.on('chatMessage', data => console.log(`Player2 hears: ${data}`));


		new Promise(resolve => {
			this.client1.emit('createNewRoom', {a: 1});

			this.client1.on('playerCreated', ({playerID}) => {
				this.client1.playerID = playerID;
			});

			this.client1.once('roomEntered', ({roomID}) => {
				this.client1.roomID = roomID;
				this.client2.emit('knockToRoom', {roomID})
			});

			this.client2.on('playerCreated', ({playerID}) => {
				this.client2.playerID = playerID;
			});

			this.client2.on('roomEntered', ({roomID}) => {
				this.client2.roomID = roomID;
			});

			this.client1.once('startGame', () => resolve())
		})
			.then(() => {
				this.client2.emit('chatMessage', 'Hello')
			})
			// .then(() => playMatch('paper', 'rock', this.client1, this.client2))
			// .then(() => playerReconnect(this.client1))
			// .then((newPlayer) => this.client1 = newPlayer)
			// .then(() => {
			// 	this.client2.emit('chatMessage', 'Hello')
			// })
			// .then(() => playMatch('paper', 'rock', this.client1, this.client2))

		// .then(() => {
		// 	let
		// 		oldPlayer1Id = this.client1.playerID,
		// 		oldRoomId = this.client1.roomID;
		//
		// 	setTimeout(() => {
		// 		this.client1.close()
		// 	}, 500);
		//
		// 	setTimeout(() => {
		// 		this.client1 = io.connect(this.apiUrl);
		// 		this.client1.on('chatMessage', data => console.log(`Player1 hears: ${data}`));
		// 		this.client1.emit('reconnectToRoom', {
		// 			playerID: oldPlayer1Id,
		// 			roomID: oldRoomId
		// 		})
		// 	}, 1000);
		// });


		// new Promise(resolve => {
		// 	this.client1.emit('createNewRoom', {a: 1});
		//
		// 	this.client1.on('playerCreated', ({playerID}) => {
		// 		this.client1.playerID = playerID;
		// 	});
		//
		// 	this.client1.once('roomEntered', ({roomID}) => {
		// 		this.client1.roomID = roomID;
		//
		// 		this.client2.emit('knockToRoom', {roomID})
		// 	});
		//
		// 	this.client2.on('playerCreated', ({playerID}) => {
		// 		this.client2.playerID = playerID;
		// 	});
		//
		// 	this.client2.on('roomEntered', ({roomID}) => {
		// 		this.client2.roomID = roomID;
		// 	});
		//
		// 	this.client1.once('startGame', () => resolve())
		// })
		// 		.then(() => playMatch('paper', 'rock'))
		// 		.then(() => playMatch('rock', 'rock'))
		// 		.then(() => playMatch('rock', 'paper'))
		// 		.then(() => playMatch('paper', 'rock'))
	}


	render() {
		return (
			<div>
				<h1>Hello world</h1>
			</div>
		);
	}
}

export default TestApp;
