import React from 'react';
import PropTypes from 'prop-types';

class GameBoard extends React.Component {
	constructor(props) {
		super(props);

		this.animSpeed = 200;
		this.animCompleted = true;
	}

	loadSvg = (s) => {
		const Snap = window.Snap;
		return new Promise((resolve) => {
			Snap.load(process.env.PUBLIC_URL + `/single-gestures.svg`, svg => {
				s.append(svg);
				const svgContainer = s.select('svg');
				svgContainer.attr({'height': ''});
				svgContainer.attr({'width': ''});
				resolve();
			});
		})
	};

	gestureFade = (s, gestureID, direction) => {
		const target = s.select(`#${gestureID}`);
		if (!target) return;

		let endOpacity = '';
		switch (direction) {
			case 'in':
				endOpacity = 1;
				break;
			case 'out':
				endOpacity = 0;
				break;
			default:
				return;
		}

		return new Promise(resolve => {
			target.animate(
					{
						opacity: endOpacity
					},
					this.animSpeed,
					window.mina.linear,
					resolve
			)
		})
	};

	gestureToggle = (s, gestureID) => {
		const all = Array.from(s.selectAll(`.item`));
		let toFadeOut = null;

		if (! this.animCompleted) {
			return;
		} else {
			this.animCompleted = false;
		}

		all.forEach(gesture => {
			if (gesture.attr('opacity') == 1) {
				toFadeOut = gesture.attr('id');
			}
		});

		this.gestureFade(s, toFadeOut, 'out')
				.then(() => {
					this.gestureFade(s, gestureID, 'in')
							.then(() => this.animCompleted = true);
				});
	};

	componentDidMount() {
		const Snap = window.Snap;
		this.yourS = Snap(this.refs['your-gesture']);
		this.opponentS = Snap(this.refs['opponents-gesture']);

		this.loadSvg(this.yourS)
				.then(() => {
					this.gestureFade(this.yourS, 'question', 'in');
				});

		this.loadSvg(this.opponentS)
				.then(() => {
					this.gestureFade(this.opponentS, 'question', 'in');
				});
	}

	componentDidUpdate(oldProps) {
		const {your, opponents} = this.props;

		if (oldProps.your !== your) {
			this.gestureToggle(this.yourS, this.props.your);
		}

		if (oldProps.opponents !== opponents) {
			this.gestureToggle(this.opponentS, this.props.opponentS);
		}
	}


	render() {
		return (
				<section id="game-board">
					<div className="game-board container">
						<div className="game-board__your-gesture game-board__gesture">
							<p className="game-board__gesture-title">Your gesture</p>
							<div ref="your-gesture"/>
						</div>
						<div className="game-board__separator"></div>
						<div className="game-board__opponent-gesture game-board__gesture">
							<p className="game-board__gesture-title">Opponent`s gesture</p>
							<div ref="opponents-gesture"/>
						</div>
					</div>
				</section>
		)
	}
}

GameBoard.defaultProps = {
	your: 'question',
	opponents: 'question'
};

GameBoard.propTypes = {
	your: PropTypes.string.isRequired,
	opponents: PropTypes.string.isRequired
};

export default GameBoard;