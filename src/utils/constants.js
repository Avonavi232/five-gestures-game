export const gameStatuses = {
    initialServer: 1,
    waitingServer: 2,
    waitingClient: 3,
    active: 4,
    end: 5,
    connectError: 6,
};

export const gameSides = {
    client: 'client',
    server: 'server',
};

export const onEvents = {
    playerCreated: 'playerCreated', //TODO: remove
    playerInitSuccess: 'playerInitSuccess',
    roomEntered: 'roomEntered',
    roomReconnected: 'roomReconnected',
    startGame: 'startGame',
    madeMove: 'madeMove',
    matchResult: 'matchResult',
    gameResult: 'gameResult',
    message: 'message',
    chatMessage: 'chatMessage',

    //default
    connectError: 'connect_error',
    reconnect: 'reconnect'
};

export const emitEvents = {
    playerInit: 'playerInit',
    knockToRoom: 'knockToRoom',
    createNewRoom: 'createNewRoom',
    chatMessage: 'chatMessage',
    reconnectToRoom: 'reconnectToRoom',
};