import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

class StartForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxScore: 3,
            chatEnable: true
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        this.props.onSubmit(this.state);
    };

    handleInputChange = (event, value) => {
        if (event.target.type === 'checkbox') {
            this.setState({
                [event.target.name]: event.target.checked
            })
        } else {
            this.setState({
                [event.target.name]: value
            })
        }
    };


    render() {
        return (
            <section className="startgame-form">
                <div className="container">
                    <form
                        className="startgame-form__form"
                        action="#"
                        onSubmit={this.handleSubmit}
                    >
                        <div className="startgame-form__item startgame-form__submit">
                            <button type="submit" className="button button_main">Get ready!</button>
                        </div>
                        <div className="startgame-form__item startgame-form__checkbox">
                            <label>
                                <input
                                    name="chatEnable"
                                    type="checkbox"
                                    checked={this.state.chatEnable}
                                    onChange={this.handleInputChange}
                                />
                                <span>Chat Enable</span>
                            </label>
                        </div>
                        <div className="startgame-form__item startgame-form__input">
                            <label>
                                <input
                                    value={this.state.maxScore}
                                    onChange={this.handleInputChange}
                                    name="maxScore"
                                    type="number"
                                />
                                <span>points play up to</span>
                            </label>
                        </div>
                    </form>
                </div>
            </section>
        );
    }
}

export default StartForm;

