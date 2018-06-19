import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dashboard from './Dashboard';

import {getComposedPath, findTargetInPath} from "../utils/functions";
import Chat from './Chat';
import Gestures from './Gestures';
import GameBoard from './GameBoard';

class ActiveScreen extends Component {
	render() {
		const {maxScore, chatEnable, playerWins, opponentWins, matches, playerGesture, opponentGesture} = this.props;
		return (
				<div className="active-game">
					<Dashboard
							maxScore={maxScore}
							playerWins={playerWins}
							opponentWins={opponentWins}
							matches={matches}
					/>

					<GameBoard
							playerGesture={playerGesture ? playerGesture : undefined}
							opponentGesture={opponentGesture ? opponentGesture : undefined}
					/>

					<Gestures onSubmit={this.props.onSubmit}/>

					{
						chatEnable ?
								<Chat
										onMessageSend={this.props.onMessageSend}
										messages={this.props.messages}
								/> :
								undefined
					}
				</div>
		);
	}
}

ActiveScreen.propTypes = {
	onMessageSend: PropTypes.func.isRequired,
	messages: PropTypes.array,
	playerWins: PropTypes.number.isRequired,
	opponentWins: PropTypes.number.isRequired,
	matches: PropTypes.array.isRequired
};

ActiveScreen.defaultProps = {
	playerWins: 0,
	opponentWins: 0,
	matches: []
};

export default ActiveScreen;