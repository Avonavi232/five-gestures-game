import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Provider} from 'react-redux';

import App from './App';
import TestApp from './TestApp';
import './assets/bootstrap.css';
import './styles/style.css';

//Redux
import store from './store';

ReactDOM.render(
		<MuiThemeProvider>
			<Provider store={store}>
				<App/>
			</Provider>
		</MuiThemeProvider>,
		document.getElementById('root')
);