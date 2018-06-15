import React, {Component} from 'react';

function copyToClipboard(elem) {
	// create hidden text element, if it doesn't already exist
	var targetId = "_hiddenCopyText_";
	var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
	var origSelectionStart, origSelectionEnd;
	if (isInput) {
		// can just use the original source element for the selection and copy
		target = elem;
		origSelectionStart = elem.selectionStart;
		origSelectionEnd = elem.selectionEnd;
	} else {
		// must use a temporary form element for the selection and copy
		target = document.getElementById(targetId);
		if (!target) {
			var target = document.createElement("textarea");
			target.style.position = "absolute";
			target.style.left = "-9999px";
			target.style.top = "0";
			target.id = targetId;
			document.body.appendChild(target);
		}
		target.textContent = elem.textContent;
	}
	// select the content
	var currentFocus = document.activeElement;
	target.focus();
	target.setSelectionRange(0, target.value.length);

	// copy the selection
	var succeed;
	try {
		succeed = document.execCommand("copy");
	} catch(e) {
		succeed = false;
	}
	// restore original focus
	if (currentFocus && typeof currentFocus.focus === "function") {
		currentFocus.focus();
	}

	if (isInput) {
		// restore prior selection
		elem.setSelectionRange(origSelectionStart, origSelectionEnd);
	} else {
		// clear temporary content
		target.textContent = "";
	}
	return succeed;
}

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
		console.log(this.props);
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

export default Waiting;