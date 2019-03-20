import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {getDeepProp} from "../utils/functions";

//Redux
import {connect} from 'react-redux';

const style = {
    height: 'calc(80vh - 40px)',
    width: 'calc(100vw - 40px)',
    margin: 20,
    textAlign: 'center',
    display: 'inline-block',
};

class EndScreen extends Component {
	render() {
		const text = this.props.win ? "Вы выиграли" : "Вы проиграли";
		return (
			<Paper style={style} zDepth={2}>
                <p>{text}</p>
			</Paper>
		);
	}
}

const mapStateToProps = state => ({
	win: getDeepProp(state, 'status.win'),
});

export default connect(mapStateToProps)(EndScreen);