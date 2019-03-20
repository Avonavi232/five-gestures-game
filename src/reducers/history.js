import * as C from '../actions/actionTypes';

const historyReducer = (state, action) => {
    state = state || {
        playerWinsCounter: 0,
        opponentWinsCounter: 0,
        messagesArchive: [],
        matchesArchive: [],
    };

    switch (action.type) {
        case C.INCREASE_PLAYER_WINS_COUNTER:
            return {
                ...state,
                playerWinsCounter: state.playerWinsCounter + 1
            };

        case C.INCREASE_OPPONENT_WINS_COUNTER:
            return {
                ...state,
                opponentWinsCounter: state.opponentWinsCounter + 1
            };

        case C.PUSH_MESSAGES_ARCHIVE:
            return {
                ...state,
                messagesArchive: state.messagesArchive.concat(action.payload)
            };

        case C.CLEAR_MESSAGES_ARCHIVE:
            return {
                ...state,
                messagesArchive: []
            };

        case C.PUSH_MATCHES_ARCHIVE:
            return {
                ...state,
                matchesArchive: state.matchesArchive.concat(action.payload)
            };

        case C.CLEAR_MATCHES_ARCHIVE:
            return {
                ...state,
                matchesArchive: []
            };

        case C.RESTORE_MATCHES_ARCHIVE:
            return action.payload;

        default:
            return state
    }
};

export default historyReducer;
