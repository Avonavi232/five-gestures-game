import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Gesture from './SingleGesture';

class Dashboard extends Component {
	componentDidUpdate(){
		console.log('Dashboard componentDidUpdate', this.props);
	}

	render() {
		const {playerWins, opponentWins, matches} = this.props;
		console.log('Dashboard render matches', matches);

		return (
				<section id="dashboard">
					<div className="container">
						<div className="dashboard">
							<div className="dashboard__table dashboard-table">
								<p className="dashboard-table__title dashboard-table__item">You</p>
								<p className="dashboard-table__item">{playerWins}</p>
								<p className="dashboard-table__item dashboard-table__separator">:</p>
								<p className="dashboard-table__item">{opponentWins}</p>
								<p className="dashboard-table__title dashboard-table__item">Opponent</p>
							</div>
							<div className="dashboard__matches dashboard-matches">
								{
									matches.map((match, index) =>
											<div key={index} className="dashboard-matches__match dashboard-match">
												<p className="dashboard-match__title">Match {index + 1}</p>
												<div className="dashboard-match__svg">
													<Gesture color={match.color} gestureID={match.playerDidTurn}/>
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
	playerWins: PropTypes.number.isRequired,
	opponentWins: PropTypes.number.isRequired,
	matches: PropTypes.array.isRequired
};

Dashboard.defaultProps = {
	playerWins: 0,
	opponentWins: 0,
	matches: []
};

export default Dashboard;