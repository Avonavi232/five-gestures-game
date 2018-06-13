import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

class StartForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			maxScore: 3,
			chatEnable: true
		}
	}

	handleSubmit = event => {
		event.preventDefault();
		this.props.onSubmit(this.state);
	};

	handleInputChange = (event, value) => {
		if (event.target.type === 'checkbox') {
			this.setState({
				[event.target.name]: event.target.checked
			})
		} else {
			this.setState({
				[event.target.name]: value
			})
		}
	};


	render() {
		return (
				<div className="container">
					<section className="start-game">
						<form action="#" onSubmit={this.handleSubmit}>
							<RaisedButton
									label="Get Ready!"
									primary={true}
									type="submit"
									className="start-game__item start-game__submit"
									fullWidth={true}
							/>
							<Checkbox
									label="Chat Enable"
									checked={this.state.chatEnable}
									onCheck={this.handleInputChange}
									name="chatEnable"
									className="start-game__item"
							/>
							<TextField
									hintText="Number of matches per game"
									value={this.state.maxScore}
									floatingLabelText="Number of matches per game"
									type="number"
									name="maxScore"
									onChange={this.handleInputChange}
									className="start-game__item"
							/>
						</form>
					</section>
				</div>
		);
	}
}

export default StartForm;

