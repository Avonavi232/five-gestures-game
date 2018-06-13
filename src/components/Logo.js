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
		})
	};


	render() {
		return (
				<div className="container">
					<section className="logo" ref="logo"></section>
				</div>
		);
	}
}

export default Logo;
