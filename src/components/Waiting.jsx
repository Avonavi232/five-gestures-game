import React, {Component} from 'react';
import {copyToClipboard, getDeepProp} from "../utils/functions";

import {connect} from 'react-redux';

class Waiting extends Component {
	state = {
		copied: false
	};

	handleCopy = () => {
		const link = this.refs.link;
		const result = copyToClipboard(link);
		this.setState({copied: result});
	};

	render() {
		return (
            <section className="waiting">
                <div className="container">
                    <div className="waiting__wrapper">
                        <p className="waiting__placeholder">Now you need to send the link to your friend you want to play with.</p>
                        <div className="waiting__link-wrapper">
                            <div ref="link" className="waiting__link">{this.props.roomUrl}</div>
                            <div
								className="waiting__copy-btn"
                                onClick={this.handleCopy}
							>Copy</div>
                            {
                                this.state.copied &&
                                <div className="waiting__copied">
                                    <p>Copied to clipboard</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </section>
		);
	}
}

Waiting.defaultProps = {
	roomUrl: `${window.location}?roomID=default`
};

const mapStateToProps = state => ({
	roomUrl: getDeepProp(state, 'settings.roomUrl')
});

export default connect(mapStateToProps)(Waiting);