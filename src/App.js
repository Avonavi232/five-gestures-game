import React, {Component} from 'react'
import io from 'socket.io-client';
import axios from 'axios';
import {parse} from 'query-string';
import {getDeepProp} from "./utils/functions";

import ActiveScreen from './components/ActiveScreen';
import Waiting from './components/Waiting';
import EndScreen from './components/EndScreen';
import Logo from './components/Logo';
import CreateRoomForm from './components/StartForm';
import {gameSides, gameStatuses, onEvents, emitEvents} from "./utils/constants";

//Redux
import {connect} from 'react-redux';
import * as actions from "./actions";

class App extends Component {
    constructor(props) {
        super(props);

        this.apiUrl = process.env.NODE_ENV === 'production' ?
            'https://infinite-hamlet-56730.herokuapp.com' :
            'http://localhost:5000';
    }

    componentDidMount() {
        /*Устанавливаем соединение с сокетом*/
        this.init();

        /*Перед уходом из игры (релоад, выгрузка) сохраняем стейт*/
        window.addEventListener('beforeunload', this.saveGameHistory);
    }

    componentWillUnmount() {
        this.saveGameHistory();
    }

    /**
     *
     */
    init() {
        const
            {dispatch} = this.props,
            {roomID} = parse(window.location.search),
            settings = {},
            restored = this.restoreGameHistory();

        let gameStatus;

        this.createPlayer()
            .then(({error, data}) => {
                if (error || !data.playerID) {
                    return Promise.reject(new Error('Create player failed'))
                }

                if (restored) {
                    settings.playerID = restored.playerID;

                    this.reconnectToRoom({
                        roomID: restored.roomID,
                        playerID: data.playerID,
                        reconnectingPlayerID: restored.playerID,
                    })
                } else if (roomID) {
                    settings.side = gameSides.client;
                    settings.playerID = data.playerID;
                    gameStatus = gameStatuses.waitingClient;
                    this.connectToRoom({roomID, playerID: settings.playerID})
                } else {
                    settings.side = gameSides.server;
                    settings.playerID = data.playerID;
                    gameStatus = gameStatuses.initialServer;
                }

                dispatch(actions.setRoomSettings(settings));
                dispatch(actions.setGameStatus(gameStatus));
            })
            .catch(e => {
                console.error(e);
                dispatch(actions.setGameStatus(gameStatuses.connectError))
            })
    }

    createPlayer() {
        return axios.get(`${this.apiUrl}/create-player`)
            .then(responce => responce.data);
    }

    _playerSocketInit(playerID) {
        const socket = io(this.apiUrl);

        this.props.dispatch(actions.setRoomSettings({socket}));

        return new Promise((resolve, reject) => {
            socket.on('connect', () => {
                socket.once(onEvents.playerInitSuccess, success => {
                    return success ? resolve(socket) : reject(new Error('playerInitSuccess returns false'))
                });

                socket.emit(emitEvents.playerInit, {playerID});
            })
        });
    }

    createRoom(settings) {
        return axios.post(`${this.apiUrl}/create-room`, {
            playerID: this.props.playerID,
            settings
        })
            .then(responce => responce.data)
            .then(({error, data}) => {
                if (error || !data.roomID) {
                    return Promise.reject(new Error('Create room failed'))
                } else {
                    this.props.dispatch(actions.setRoomSettings({roomID: data.roomID}));

                    return Promise.resolve(data);
                }
            })
    }

    connectToRoom = ({roomID, playerID}) => {
        this._playerSocketInit(playerID)
            .then(socket => {
                this._subscribeToSocketEvents(socket);

                socket.emit(emitEvents.knockToRoom, {roomID})
            })
            .catch((e) => console.error(e));
    };

    reconnectToRoom({roomID, playerID, reconnectingPlayerID}) {
        this._playerSocketInit(playerID)
            .then(socket => {
                this._subscribeToSocketEvents(socket);
                socket.emit(emitEvents.knockToRoom, {roomID, reconnectingPlayerID})
            })
            .catch((e) => console.error(e));
    }

    /*Сохранение/восстановление истории матча*/
    saveGameHistory = () => {
        if (this.props.gameStatus === gameStatuses.active) {
            localStorage.setItem(
                `game_save`,
                JSON.stringify({
                    history: this.props.history,
                    playerID: this.props.playerID,
                    roomID: this.props.roomID
                })
            );
        } else {
            localStorage.removeItem(`game_save`);
        }
    };

    restoreGameHistory = () => {
        try {
            const save = JSON.parse(localStorage.getItem(`game_save`));
            if (save && save.history) {
                this.props.dispatch(actions.restoreMatchesArchive(save.history));
                this.props.dispatch(actions.setRoomSettings({
                    playerID: save.playerID,
                    roomID: save.roomID
                }));
            }
            return save;
        } catch (e) {
            console.error(e);
            return false;
        }
    };


    /*Socket.io events*/
    _subscribeToSocketEvents = socket => {
        //Default events
        socket.on(onEvents.connectError, this.connectErrorHandler);
        socket.on(onEvents.reconnect, this.socketReconnectHandler);

        //Custom events
        socket.on(onEvents.roomEntered, this.roomEnteredHandler);
        socket.on(onEvents.startGame, this.startGameHandler);
        socket.on(onEvents.madeMove, this.madeMoveHandler);
        socket.on(onEvents.matchResult, this.matchResultHandler);
        socket.on(onEvents.gameResult, this.gameResultHandler);
        socket.on(onEvents.chatMessage, this.receiveChatMessageHandler);
    };

    connectErrorHandler = () => {
        const {gameStatus, dispatch} = this.props;

        if (gameStatus !== gameStatuses.connectError) {
            dispatch(actions.setLastSuccessGameStatus());
            dispatch(actions.setGameStatus(gameStatuses.connectError))
        }
    };

    socketReconnectHandler = () => {
        const {gameStatus, dispatch, lastSuccessGameStatus} = this.props;
        if (gameStatus === gameStatuses.connectError) {
            dispatch(actions.setGameStatus(lastSuccessGameStatus))
        }
    };

    roomEnteredHandler = ({roomID, playerID, settings}) => {
        const {dispatch, side} = this.props;
        let status;

        settings.roomUrl = `${window.location.origin}/?roomID=${roomID}`;
        settings.roomID = roomID;

        if (side === gameSides.server) {
            status = gameStatuses.waitingServer;
            window.history.pushState(null, 'RoomName', settings.roomUrl);
        }

        dispatch(actions.setRoomSettings(settings));
        status && dispatch(actions.setGameStatus(status));
    };

    startGameHandler = () => {
        this.props.dispatch(actions.setGameStatus(gameStatuses.active));
    };

    receiveChatMessageHandler = responce => {
        const {dispatch, playerID} = this.props;

        dispatch(actions.pushMessagesArchive({
            message: responce.message,
            author: playerID === responce.playerID ? 'Me' : 'Opponent'
        }));
    };

    matchResultHandler = winnerID => {
        const
            {playerID, dispatch} = this.props,
            match = {
                playerMove: this.props.playerMove,
                color: ''
            };
        let updateCounter;

        if (winnerID === false) {
            match.color = 'grey';
        } else if (winnerID === playerID) {
            match.color = 'green';
            updateCounter = actions.increasePlayerWinsCounter;
        } else {
            match.color = 'red';
            updateCounter = actions.increaseOpponentWinsCounter;
        }


        setTimeout(() => {
            typeof updateCounter === 'function' && dispatch(updateCounter());
            dispatch(actions.clearMoves());
            dispatch(actions.pushMatchesArchive(match));
        }, 1000);
    };

    gameResultHandler = winnerID => {
        const {dispatch, playerID} = this.props;

        const win = winnerID === playerID;

        setTimeout(() => {
            dispatch(actions.setWin(win));
            dispatch(actions.setGameStatus(gameStatuses.end));
        }, 1000);
    };

    madeMoveHandler = ({playerID, gesture}) => {
        const {dispatch} = this.props;
        if (this.props.playerID === playerID) {
            //It is me
            dispatch(actions.playerMove(gesture));
        } else {
            //Its opponent
            dispatch(actions.opponentMove(gesture));
        }
    };

    render() {
        const {gameStatus} = this.props;

        return (
            <div className="app">
                {
                    [
                        gameStatuses.initialServer,
                        gameStatuses.waitingClient,
                        gameStatuses.waitingServer,
                    ].includes(gameStatus) &&
                    <Logo/>
                }
                {
                    gameStatus === gameStatuses.initialServer &&
                    <CreateRoomForm
                        createRoom={this.createRoom.bind(this)}
                        connectToRoom={this.connectToRoom}
                    />
                }
                {
                    gameStatus === gameStatuses.waitingServer &&
                    <Waiting/>
                }
                {
                    gameStatus === gameStatuses.waitingClient &&
                    <p>Client is waiting</p>
                }
                {
                    gameStatus === gameStatuses.active &&
                    <ActiveScreen/>
                }
                {
                    gameStatus === gameStatuses.end &&
                    <EndScreen/>
                }

                {
                    gameStatus === gameStatuses.connectError &&
                    <h1>Sorry <br/> Connect Error</h1>
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    roomID: getDeepProp(state, 'settings.roomID'),
    playerID: getDeepProp(state, 'settings.playerID'),
    settings: getDeepProp(state, 'settings'),
    side: getDeepProp(state, 'settings.side'),
    gameStatus: getDeepProp(state, 'status.gameStatus'),
    lastSuccessGameStatus: getDeepProp(state, 'status.lastSuccessGameStatus'),
    playerMove: getDeepProp(state, 'status.playerMove'),
    history: getDeepProp(state, 'history'),
});
export default connect(mapStateToProps)(App);
