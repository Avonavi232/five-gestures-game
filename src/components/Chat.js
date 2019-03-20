import React from 'react';
import PropTypes from 'prop-types';

import {getDeepProp} from "../utils/functions";
import {onEvents, emitEvents} from "../utils/constants";

//Redux
import {connect} from 'react-redux';


class Chat extends React.Component {
    handleSubmit = event => {
        event.preventDefault();
        this.props.socket.emit(emitEvents.chatMessage, event.target.message.value);
        event.target.message.value = '';
    };


    render() {
        const {messages} = this.props;
        return (
            <section id="chat">
                <div className="container">
                    <div className="chat">
                        <div className="chat__toggle">
                            <div className="chat__toggle-icon"/>
                        </div>
                        <div className="chat__list">
                            {
                                (messages && messages.length) ?
                                    messages.map((message, index) =>
                                        <div key={index} className="chat__message chat-message">
                                            <span className="chat-message__author">{message.author}</span>
                                            <span className="chat-message__content">{message.message}</span>
                                        </div>
                                    ) :
                                    null
                            }
                        </div>
                        <div className="chat__interface">
                            <form action="#" className="chat__form" onSubmit={this.handleSubmit}>
                                <input autoComplete="off" name="message" type="text" className="chat__input"/>
                                <button
                                    type="submit"
                                    className="chat__submit"
                                >Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

Chat.propTypes = {
    messages: PropTypes.array
};

const mapStateToProps = state => ({
    messages: getDeepProp(state, 'history.messagesArchive'),
    socket: getDeepProp(state, 'settings.socket')
});

export default connect(mapStateToProps)(Chat);