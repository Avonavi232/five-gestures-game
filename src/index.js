import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';
import './assets/bootstrap.css';
import './styles/style.css';

import TestApp from './TestApp';

ReactDOM.render(
		<MuiThemeProvider>
			<TestApp />
		</MuiThemeProvider>,
		document.getElementById('root')
);

registerServiceWorker();