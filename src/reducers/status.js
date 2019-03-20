import * as C from '../actions/actionTypes';

const statusReducer = (state, action) => {
    state = state || {
        gameStatus: undefined,
        lastSuccessGameStatus: undefined,
        playerMove: null,
        opponentMove: null,
        win: null
    };

    switch (action.type) {
        case C.SET_GAME_STATUS:
            return {
                ...state,
                gameStatus: action.payload
            };

        case C.SET_LAST_SUCCESS_GAME_STATUS:
            return {
                ...state,
                lastSuccessGameStatus: action.payload !== undefined ? action.payload : state.gameStatus
            };

        case C.PLAYER_MOVE:
            return {
                ...state,
                playerMove: action.payload
            };

        case C.OPPONENT_MOVE:
            return {
                ...state,
                opponentMove: action.payload
            };

        case C.CLEAR_MOVES:
            return {
                ...state,
                opponentMove: null,
                playerMove: null,
            };

        case C.SET_WIN:
            return {
                ...state,
                win: action.payload
            };

        default:
            return state
    }
};

export default statusReducer;
