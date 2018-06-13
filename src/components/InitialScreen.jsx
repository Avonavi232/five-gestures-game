import React, {Component} from 'react';

import Logo from './Logo';
import StartForm from './StartForm';

class InitialScreen extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
				<React.Fragment>
					<Logo/>
					<StartForm onSubmit={this.props.onSubmit}/>
				</React.Fragment>
		);
	}
}

export default InitialScreen;
