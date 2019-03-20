import * as C from './actionTypes';

export const setRoomSettings = settings => ({
    type: C.SET_ROOM_SETTINGS,
    settings
});


export const setGameStatus = payload => ({
    type: C.SET_GAME_STATUS,
    payload
});

export const setLastSuccessGameStatus = payload => ({
    type: C.SET_LAST_SUCCESS_GAME_STATUS,
    payload
});

export const playerMove = payload => ({
    type: C.PLAYER_MOVE,
    payload
});

export const opponentMove = payload => ({
    type: C.OPPONENT_MOVE,
    payload
});

export const clearMoves = () => ({
    type: C.CLEAR_MOVES,
});

export const setWin = payload => ({
    type: C.SET_WIN,
    payload
});





export const increasePlayerWinsCounter = () => ({
    type: C.INCREASE_PLAYER_WINS_COUNTER
});

export const increaseOpponentWinsCounter = () => ({
    type: C.INCREASE_OPPONENT_WINS_COUNTER
});

export const pushMessagesArchive = payload => ({
    type: C.PUSH_MESSAGES_ARCHIVE,
    payload
});

export const clearMessagesArchive = payload => ({
    type: C.CLEAR_MESSAGES_ARCHIVE,
    payload
});

export const pushMatchesArchive = payload => ({
    type: C.PUSH_MATCHES_ARCHIVE,
    payload
});

export const clearMatchesArchive = payload => ({
    type: C.CLEAR_MATCHES_ARCHIVE,
    payload
});

export const restoreMatchesArchive = payload => ({
    type: C.RESTORE_MATCHES_ARCHIVE,
    payload
});


/***************************/

