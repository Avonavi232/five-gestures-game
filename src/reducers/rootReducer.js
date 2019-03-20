import {combineReducers} from 'redux';

import settings from './settings';
import status from './status';
import history from './history';

const rootReducer = combineReducers({
    settings,
    status,
    history
});

export default rootReducer;