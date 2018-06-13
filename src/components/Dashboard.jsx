import React, {Component} from 'react';

class Dashboard extends Component {
	render() {
		const {wins, maxScore} = this.props;
		return (
				<div className="dashboard">
					<p>Max Score: {maxScore}</p>
					<p>Wins: {wins}</p>
				</div>
		);
	}
}

export default Dashboard;