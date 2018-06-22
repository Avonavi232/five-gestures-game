import React, {Component} from 'react';

class Logo extends Component {
	constructor(props) {
		super(props);

	}

	componentDidMount = () => {
		const Snap = window.Snap;
		const s = Snap(this.refs.logo);
		Snap.load(process.env.PUBLIC_URL + '/logo.svg', svg => {
			s.append(svg);
            const svgTag = s.select('svg');
            svgTag.attr({'class': 'game-logo__svg'});
		});
	};


	render() {
		return (
			<section className="game-logo">
				<div className="container" ref="logo"></div>
			</section>
		);
	}
}

export default Logo;
