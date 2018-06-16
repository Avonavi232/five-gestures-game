import React from 'react';
import PropTypes from 'prop-types';

class SingleGesture extends React.Component {
	colors = {
		green: {
			fill: '#afca90',
			stroke: '#66883f'
		},
		red: {
			fill: '#f47c72',
			stroke: '#c26161'
		},
		grey: {
			fill: '#eeeeee',
			stroke: '#cccccc'
		},
	};

	loadSvg = (s, gestureID) => {
		const Snap = window.Snap;

		return new Promise((resolve) => {
			Snap.load(process.env.PUBLIC_URL + `/single-gestures.svg`, svg => {
				const target = svg.select(`#${gestureID}`);
				s.append(svg);
				const all = s.selectAll('.item');
				const svgContainer = s.select('svg');

				all.forEach(el => {
					if (el.attr('id') !== gestureID) {
						el.remove();
					}
				});

				svgContainer.attr({'height': ''});
				svgContainer.attr({'width': ''});

				resolve(target);
			});
		})
	};

	gestureFade = (s, gesture, direction) => {
		return new Promise((resolve) => {
			if (!gesture) {
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

			gesture.animate(
					{
						opacity: endOpacity
					},
					200,
					window.mina.linear,
					() => resolve(gesture)
			)
		})
	};

	colorGesture(gesture, whatToColor, colors){
		const items = gesture.selectAll(whatToColor);
		items.forEach(item => {
			item.attr({
				fill: colors['fill'],
				stroke: colors['stroke']
			});
		})
	}

	componentDidMount(){
		const Snap = window.Snap;
		this.s = Snap(this.refs['svgWrapper']);
		this.loadSvg(this.s, this.props.gestureID)
				.then(target => {
					this.colorGesture(target, '.itemBackground', this.colors[this.props.color]);
					this.gestureFade(this.s, target, 'in');
				});
	}

	render() {
		return (
				<div ref="svgWrapper"/>
		)
	}
}

SingleGesture.propTypes = {
	color: PropTypes.string.isRequired,
	gestureID: PropTypes.string.isRequired
};

export default SingleGesture;