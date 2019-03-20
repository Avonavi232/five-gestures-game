import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dashboard from './Dashboard';

import {getComposedPath, findTargetInPath, getDeepProp} from "../utils/functions";
import Chat from './Chat';
import Gestures from './Gestures';
import GameBoard from './GameBoard';

//Redux
import {connect} from 'react-redux';

class ActiveScreen extends Component {
	render() {
		return (
				<div className="active-game">
					<Dashboard />

					<GameBoard />

					<Gestures onSubmit={this.props.onSubmit}/>

					{
						!!this.props.chatEnable &&
								<Chat
										onMessageSend={()=>{}}
										messages={this.props.messages}
								/>
					}
				</div>
		);
	}
}

ActiveScreen.propTypes = {
	messages: PropTypes.array,
	playerWinsCounter: PropTypes.number.isRequired,
	opponentWinsCounter: PropTypes.number.isRequired,
	matches: PropTypes.array.isRequired
};


const mapStateToProps = state => ({
	maxScore: getDeepProp(state, 'settings.maxScore'),
	chatEnable: getDeepProp(state, 'settings.chatEnable'),
	playerWinsCounter: getDeepProp(state, 'history.playerWinsCounter'),
	opponentWinsCounter: getDeepProp(state, 'history.opponentWinsCounter'),
	matches: getDeepProp(state, 'history.matchesArchive'),
	messages: getDeepProp(state, 'history.messagesArchive'),
});

export default connect(mapStateToProps)(ActiveScreen);