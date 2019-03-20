import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Gesture from './SingleGesture';
import {getDeepProp} from "../utils/functions";

//Redux
import {connect} from "react-redux";

class Dashboard extends Component {
	render() {
		const {playerWinsCounter, opponentWinsCounter, matches} = this.props;

		return (
				<section id="dashboard">
					<div className="container">
						<div className="dashboard">
							<div className="dashboard__table dashboard-table">
								<p className="dashboard-table__title dashboard-table__item">You</p>
								<p className="dashboard-table__item">{playerWinsCounter}</p>
								<p className="dashboard-table__item dashboard-table__separator">:</p>
								<p className="dashboard-table__item">{opponentWinsCounter}</p>
								<p className="dashboard-table__title dashboard-table__item">Opponent</p>
							</div>
							<div className="dashboard__matches dashboard-matches">
								{
									matches.map((match, index) =>
											<div key={index} className="dashboard-matches__match dashboard-match">
												<p className="dashboard-match__title">Match {index + 1}</p>
												<div className="dashboard-match__svg">
													<Gesture color={match.color} gestureID={match.playerMove}/>
												</div>
											</div>
									)
								}
							</div>
						</div>
					</div>
				</section>
		);
	}
}

Dashboard.propTypes = {
	playerWinsCounter: PropTypes.number.isRequired,
	opponentWinsCounter: PropTypes.number.isRequired,
	matches: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
	playerWinsCounter: getDeepProp(state, 'history.playerWinsCounter'),
	opponentWinsCounter: getDeepProp(state, 'history.opponentWinsCounter'),
	matches: getDeepProp(state, 'history.matchesArchive'),
});

export default connect(mapStateToProps)(Dashboard);
