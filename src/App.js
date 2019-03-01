import React, {Component} from 'react'
import io from 'socket.io-client';
import uuid from 'uuid';

import ActiveScreen from './components/ActiveScreen';
import Waiting from './components/Waiting';
import EndScreen from './components/EndScreen';
import {parse_query_string} from "./utils/functions";
import Logo from './components/Logo';
import StartForm from './components/StartForm';
import SingleGesture from './components/SingleGesture';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			gameStatus: '', //статус игры, меняется, ререндерит
			playerWins: 0, //количество выигранных матчей в игре, меняется, ререндерит
			opponentWins: 0, //количество проигранных матчей в игре, меняется, ререндерит
			win: undefined, //результат игры (победа или проигрыш), меняется, ререндерит
			chatEnable: undefined,
			maxScore: undefined,
			playerDidTurn: false,
			messages: [],
			matches: []
		};

		this.settings = {
			roomID: '', //не обновляется, не требует перерендеринга
			roomUrl: '',
			playerID: this.setPlayerID() //не обновляется, не требует перерендеринга,
		};

		if (process.env.NODE_ENV === 'production') {
			this.settings.apiUrl = 'https://infinite-hamlet-56730.herokuapp.com';
		} else {
			this.settings.apiUrl = 'http://localhost:5000';
		}
	}

	componentDidMount() {
		//Restore saved state if it is
		// const savedState = localStorage.getItem(`${this.settings.playerID}_game_save`);
		// if (savedState) {
		// 	try {
		// 		this.setState(JSON.parse(savedState));
		// 	} catch (e) {
		// 		console.error(e.message);
		// 	}
		// }
	}

	_connect(){
		const {apiUrl} = this.settings;
		return io(apiUrl);
	}

	componentDidMount() {
		/*Устанавливаем соединение с сокетом*/
		this.socket = this._connect();

		/*Получаем значение roomID, если оно есть в строке location*/
		const {roomID} = parse_query_string(window.location.search);
		if (roomID) {
			this.settings.roomID = roomID;
		}

		/*Если перешли по ссылке с roomID - стучимся в комнату*/
		if (this.settings.roomID) {
			this.socket.emit('knockToRoom', {
				roomID: this.settings.roomID,
				playerID: this.settings.playerID,
			});
		} else {
			this.setState({
				gameStatus: 'initial'
			});
		}



		/*Основные события, приходящие с сервера*/
		this.socket.on('playerCreated', this.playerCreatedHandler.bind(this));
		this.socket.on('roomEntered', this.roomEnteredHandler.bind(this));
		// this.socket.on('startGame', () => this.startGameHandler());
		// this.socket.on('matchResult', winnerID => this.matchResultHandler(winnerID));
		// this.socket.on('gameResult', winnerID => this.gameResultHandler(winnerID));
		// this.socket.on('message', message => this.gotMessageHandler(message));
		// this.socket.on('chatMessage', messageObj => this.receiveMessageHandler(messageObj));


		/*Перед уходом из игры (релоад, выгрузка) сохраняем стейт*/
		// window.addEventListener('beforeunload', () => this.saveState());
	}

	componentWillUnmount() {
		this.saveState();
	}

	componentDidUpdate() {
		// console.log(this.state);
	}


	/*Сохранение состояния*/
	saveState() {
		// localStorage.setItem(
		// 		`${this.settings.playerID}_game_save`,
		// 		JSON.stringify(this.state)
		// )

		this.socket.emit('player_disconnected', {
			roomID: this.settings.roomID,
			playerID: this.settings.playerID,
		});
	}

	/*Очистка сохраненного состояния*/
	clearSavedState = () => {
		localStorage.removeItem(`${this.settings.playerID}_game_save`);
		this.setState({
			playerWins: 0,
			opponentWins: 0
		})
	};

	/*Устанавливает playerID в localStorage, если его там нет.
			* Возвращает значение*/
	setPlayerID() {
		let playerID = localStorage.getItem('playerID');
		if (!playerID) {
			playerID = uuid.v4();
			localStorage.setItem('playerID', playerID);
		}
		return playerID;
	}


	/*Socket.io handlers*/
	roomEnteredHandler({roomID, settings}) {
		if (!this.settings.roomID) {
			this.settings.roomID = roomID;
			this.settings.roomUrl = `${window.location}?roomID=${roomID}`;
			window.history.pushState(null, 'RoomName', this.settings.roomUrl);
		}
		this.setState(settings);
	}

	startGameHandler() {
		this.clearSavedState();
		this.setState({
			gameStatus: 'active'
		})
	}

	settingsSubmitHandler = ({maxScore, chatEnable}) => {
		this.socket.emit('createNewRoom', {
			playerID: this.settings.playerID,
			maxScore,
			chatEnable
		});

		this.setState({
			gameStatus: 'waiting'
		})
	};

	sendGestureHandler = gesture => {
		if (!this.state.playerDidTurn) {
			this.socket.emit('playerDidTurn', {
				roomID: this.settings.roomID,
				playerID: this.settings.playerID,
				gesture
			});
		}
	};

	sendMessageHandler = message => {
		if (this.socket) {
			this.socket.emit('chatMessage', {
				message
			});
		}
	};

	receiveMessageHandler = messageObj => {
		this.setState({
			messages: [...this.state.messages, {
				...messageObj,
				author: this.settings.playerID === messageObj.playerID ? 'Me' : 'Opponent'
			}]
		})
	};

	playerDidTurn = gesture => {
		console.log(`Вы сделали ход: ${gesture}`);
		this.setState({playerDidTurn: gesture});
	};

	opponentDidTurn = (gesture, playerID) => {
		// console.log(`Оппонент ${playerID} сделал ход: ${gesture}`);
		console.log(`Оппонент ${playerID} сделал ход`);
		this.setState({opponentDidTurn: gesture});
	};

	playerCreatedHandler = ({playerID}) => {
		this.settings.playerID = playerID;
	};


	matchResultHandler(winnerID) {
		//Когда оппонент сделал ход, нужно сбросить playerDidTurn
		const newStateFields = {
			playerDidTurn: false,
			opponentDidTurn: false
		};

		const match = {
			playerDidTurn: this.state.playerDidTurn,
			color: ''
		};

		if (winnerID === false) {
			match.color = 'grey';
			console.log("standoff");
		} else if (winnerID === this.settings.playerID) {
			console.log("Win");
			match.color = 'green';
			newStateFields.playerWins = this.state.playerWins + 1;
		} else {
			match.color = 'red';
			newStateFields.opponentWins = this.state.opponentWins + 1;
			console.log("Loose");
		}

		newStateFields.matches = [...this.state.matches, match];


		setTimeout(() => {
			this.setState(newStateFields)
		}, 1000);
	}

	gameResultHandler(winnerID) {
		let win;
		if (winnerID === this.settings.playerID) {
			win = true;
		} else {
			win = false;
		}

		setTimeout(() => {
			this.setState({
				gameStatus: 'end',
				win
			})
		}, 1000);
	}


	gotMessageHandler = message => {
		// console.log('Message from ws: ', message);
		switch (message.type) {
			case 'playerDidTurn':
				this.playerDidTurn(message.gesture);
				break;

			case 'opponentDidTurn':
				this.opponentDidTurn(message.gesture, message.playerID);
				break;

			default:
				break;
		}
	};


	render() {
		const {gameStatus, playerWins, opponentWins, matches, win, maxScore, chatEnable, playerDidTurn, messages, opponentDidTurn} = this.state;

		let opponentGesture = '';
		if (!playerDidTurn && opponentDidTurn) {
			opponentGesture = 'question';
		} else if (playerDidTurn && opponentDidTurn) {
			opponentGesture = opponentDidTurn;
		}

		return (
				<div className="app">
					{
						['initial', 'waiting'].includes(gameStatus) &&
						<Logo/>
					}
					{
						gameStatus === 'initial' &&
						<StartForm onSubmit={this.settingsSubmitHandler}/>
					}
					{
						gameStatus === 'waiting' &&
						<Waiting roomUrl={this.settings.roomUrl}/>
					}
					{
						gameStatus === 'active' &&
						<ActiveScreen
								onSubmit={this.sendGestureHandler}
								maxScore={maxScore}
								chatEnable={chatEnable}
								playerWins={playerWins}
								opponentWins={opponentWins}
								matches={matches}
								playerGesture={playerDidTurn}
								opponentGesture={opponentGesture}
								onMessageSend={this.sendMessageHandler}
								messages={messages}
						/>
					}
					{
						gameStatus === 'end' &&
						<EndScreen win={!!win}/>
					}
				</div>
		);
	}
}

export default App;
