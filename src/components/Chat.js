import React from 'react';
import PropTypes from 'prop-types';

class Chat extends React.Component {
    handleSubmit = event => {
        event.preventDefault();
        this.props.onMessageSend(event.target.message.value);
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
                                    <p>Chatty</p>
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
    onMessageSend: PropTypes.func.isRequired,
    messages: PropTypes.array
};

export default Chat;