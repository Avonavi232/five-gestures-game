import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
    height: 'calc(80vh - 40px)',
    width: 'calc(100vw - 40px)',
    margin: 20,
    textAlign: 'center',
    display: 'inline-block',
};

class EndScreen extends Component {
	render() {
		const {win} = this.props;
		return (
			<Paper style={style} zDepth={2}>
                {
                    win ?
						<div>
							Вы выиграли
						</div> :
						<div>
							Вы проиграли
						</div>
                }
			</Paper>
		);
	}
}

export default EndScreen;