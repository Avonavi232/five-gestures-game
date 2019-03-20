import * as C from '../actions/actionTypes';

const settingsReducer = (state, action) => {
    state = state || {
        chatEnable: undefined,
        maxScore: undefined,
        roomID: undefined,
        roomURL: undefined,
        playerID: undefined,
        side: undefined
    };

    switch (action.type) {
        case C.SET_ROOM_SETTINGS:
            return {
                ...state,
                ...action.settings
            };

        default:
            return state
    }
};

export default settingsReducer;
