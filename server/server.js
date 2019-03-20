const
    app = require('express')(),
    cors = require('cors'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    PORT = process.env.PORT || 5000,
    Rooms = require('./modules/rooms'),
    PlayersContainer = require('./modules/playersContainer'),
    Room = require('./modules/room'),
    Player = require('./modules/player');

app.use(cors());
app.use(bodyParser.json());

const
    roomsContainer = new Rooms(),
    playersContainer = new PlayersContainer();


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create-player', function (req, res) {
    const player = new Player();
    player.status = 'offline';

    playersContainer.add(player);

    res.json({
        error: 0,
        data: {
            playerID: player.playerID
        }
    });
});


app.post('/create-room', function (req, res) {
    if (!req.body.playerID || !req.body.settings) {
        res.send({error: 1});
        return;
    }

    //Проверим, создан ли уже плеер
    const player = playersContainer.get(req.body.playerID);
    if (!player) {
        res.send({error: 1});
        return;
    }

    const room = new Room(io, req.body.settings);
    room.owner = req.body.playerID;

    roomsContainer.addRoom(room);

    res.json({
        error: 0,
        data: {
            roomID: room.roomID
        }
    });
});


const makeMoveHandlerCreator = player => gesture => {
    const room = roomsContainer.getRoom(player.roomID);

    if (!player.didMove()) {
        player.doMove(gesture);
        player.sendToRoom('madeMove', {
            playerID: player.playerID,
            gesture
        })
    }

    if (room.isMatchOver()) {
        const winnerID = room.getMatchResult();
        room.sendToRoom('matchResult', winnerID);
        room.prepareForMatch();
    }

    if (room.isGameOver()) {
        const winnerID = room.getGameResult();
        room.sendToRoom('gameResult', winnerID);
        room.prepareForMatch()
    }
};

const knockToRoomHandlerCreator = player => ({roomID, reconnectingPlayerID}) =>  {
    const
        room = roomsContainer.getRoom(roomID),
        oldPlayer = room && reconnectingPlayerID && room.getPlayer(reconnectingPlayerID);

    if (!room) {
        return;
    }

    //On Reconnect
    if (oldPlayer && oldPlayer.status === 'offline'){
        //Отпишем новосощданного пользователя от ивентов
        player.socket.eventNames().forEach(event => {
            player.socket.removeAllListeners(event);
        });

        //Установим старому пользователю, который в комнате, новый сокет
        //Подпишем сокет на нужные ивенты
        oldPlayer.setSocket(player.socket, roomID)
            .then(() => subscribeSocket(oldPlayer));

        oldPlayer.sendToMe('roomReconnected', {
            roomID: room.roomID,
            playerID: oldPlayer.playerID,
            settings: room.settings
        });

        if (room.isReadyToPlay()) {
            room.startGame();
        }

        return;
    }

    room.subscribeForPlayer(player);
    player.enterRoom(room)
        .then(() => {
            player.sendToMe('roomEntered', {
                roomID: room.roomID,
                playerID: player.playerID,
                settings: room.settings
            });

            if (room.isReadyToPlay()) {
                room.startGame();
            }
        });
};

const disconnectHandlerCreator = player => () => {
    player.status = 'offline';

    player.socket.eventNames().forEach(event => {
        player.socket.removeAllListeners(event);
    });

    delete player.socket;
};

const chatMessageHandlerCreator = player => message => {
    player.sendToRoom('chatMessage', {
        message,
        playerID: player.playerID
    });
};

const socketGameEvents = [
    {
        name: 'makeMove',
        handlerCreator: makeMoveHandlerCreator
    },
    {
        name: 'knockToRoom',
        handlerCreator: knockToRoomHandlerCreator
    },
    {
        name: 'disconnect',
        handlerCreator: disconnectHandlerCreator
    },
    {
        name: 'chatMessage',
        handlerCreator: chatMessageHandlerCreator
    }
];

const subscribeSocket = player => {
    socketGameEvents.forEach(event => {
        player.listen(event.name, event.handlerCreator(player));
    });
};

io.on('connection', socket => {
    socket.on('playerInit', ({playerID}) => {
        const player = playersContainer.get(playerID);

        if (!player) {
            socket.emit('playerInitSuccess', false);
            return;
        }

        player.setSocket(socket)
            .then(() => {
                player.status = 'online';

                player.sendToMe('playerInitSuccess', true);

                //Подписка сокета на ивенты
                subscribeSocket(player);
            });
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




















