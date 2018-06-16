import React from 'react';
import PropTypes from 'prop-types';

class GameBoard extends React.Component {
	constructor(props) {
		super(props);

		this.animSpeed = 200;
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
		return new Promise((resolve) => {
			const target = s.select(`#${gestureID}`);

			if (!target) {
				resolve();
				return;
			}

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

	gestureToggle = () => {
		let animCompleted = true;

		return (s, gestureID, fn) => {
			const all = Array.from(s.selectAll(`.item`));
			let toFadeOut = null;

			if (! animCompleted) {
				setTimeout(() => fn(s, gestureID), 1000);
				return;
			} else {
				animCompleted = false;
			}

			all.forEach(gesture => {
				if (gesture.attr('opacity') == 1) {
					toFadeOut = gesture.attr('id');
				}
			});

			if (toFadeOut) {
				this.gestureFade(s, toFadeOut, 'out')
						.then(() => {
							this.gestureFade(s, gestureID, 'in')
									.then(() => animCompleted = true);
						});
			} else {
				this.gestureFade(s, gestureID, 'in')
						.then(() => animCompleted = true);
			}
		}
	};

	componentDidMount() {
		const Snap = window.Snap;
		this.playerSvgSurface = Snap(this.refs['playerGesture']);
		this.opponentSvgSurface = Snap(this.refs['opponentGesture']);

		this.playerAnimFn = this.gestureToggle();
		this.opponentAnimFn = this.gestureToggle();

		this.loadSvg(this.playerSvgSurface);
		this.loadSvg(this.opponentSvgSurface);
	}

	componentDidUpdate(oldProps) {
		const {playerGesture, opponentGesture} = this.props;

		console.log('GameBoard componentDidUpdate', this.props);

		if (oldProps.playerGesture !== playerGesture) {
			this.playerAnimFn(this.playerSvgSurface, playerGesture, this.playerAnimFn);
		}

		if (oldProps.opponentGesture !== opponentGesture) {
			this.opponentAnimFn(this.opponentSvgSurface, opponentGesture, this.opponentAnimFn);
		}
	}


	render() {
		return (
				<section id="game-board">
					<div className="game-board container">
						<div className="game-board__your-gesture game-board__gesture">
							<p className="game-board__gesture-title">Your gesture</p>
							<div ref="playerGesture"/>
						</div>
						<div className="game-board__separator"></div>
						<div className="game-board__opponent-gesture game-board__gesture">
							<p className="game-board__gesture-title">Opponent`s gesture</p>
							<div ref="opponentGesture"/>
						</div>
					</div>
				</section>
		)
	}
}

GameBoard.defaultProps = {
	playerGesture: 'none',
	opponentGesture: 'none'
};

GameBoard.propTypes = {
	playerGesture: PropTypes.string.isRequired,
	opponentGesture: PropTypes.string.isRequired
};

export default GameBoard;