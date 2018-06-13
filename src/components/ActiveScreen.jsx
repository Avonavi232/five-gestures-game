import React, {Component} from 'react';
import Paper from 'material-ui/Paper';

import Dashboard from './Dashboard';

import {getComposedPath, findTargetInPath} from "../utils/functions";
import svg from '../assets/game.svg';

const gameSceneStyle = {
	height: 'calc(80vh - 40px)',
	width: 'calc(100vw - 40px)',
	margin: 20,
	textAlign: 'center',
	display: 'inline-block',
};

const dashboardStyle = {
	height: 'calc(20vh - 40px)',
	width: 'calc(100vw - 40px)',
	margin: 20,
	textAlign: 'center',
	display: 'inline-block',
};

class ActiveScreen extends Component {
	defaultBgColor = {
		fill: '#eeeeee',
		stroke: '#cccccc'
	};

	hoverBgColor = {
		fill: '#66d7e5',
		stroke: '#00bcd4',
		cursor: 'pointer'
	};

	gestureHoverInHandler = item => {
		const itemBackground = item.select('.itemBackground');
		const arrows = item.select('.arrows');
		if (!itemBackground || !arrows) return;

		itemBackground.attr(this.hoverBgColor);
		arrows.attr({display: 'block'});
	};

	gestureHoverOutHandler = item => {
		const itemBackground = item.select('.itemBackground');
		const arrows = item.select('.arrows');
		if (!itemBackground || !arrows) return;

		itemBackground.attr(this.defaultBgColor);
		arrows.attr({display: 'none'});
	};

	gestureSubmitHandler = item => {
		this.props.onSubmit(item.attr('id'));
	};


	componentDidMount() {
		const Snap = window.Snap;
		const s = Snap(this.refs.svgContainer);

		Snap.load(process.env.PUBLIC_URL + '/game.svg', svg => {
			const items = svg.selectAll('.item');
			s.append(svg);
			items.forEach(item => {
				item.hover(() => this.gestureHoverInHandler(item), () => this.gestureHoverOutHandler(item));
				item.click(() => this.gestureSubmitHandler(item));
			})
		})
	}


	render() {
		const {maxScore, wins} = this.props;
		return (
				<div>
					<Paper style={dashboardStyle} zDepth={2}>
						<Dashboard
								maxScore={maxScore}
								wins={wins}
						/>
					</Paper>
					<Paper style={gameSceneStyle} zDepth={2}>
						<div className="svgContainer" ref="svgContainer"></div>
					</Paper>
				</div>
		);
	}
}

export default ActiveScreen;