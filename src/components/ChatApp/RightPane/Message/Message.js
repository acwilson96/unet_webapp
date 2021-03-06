import React, { Component } from 'react';
import './Message.css';

export default class Message extends Component {

    render() {

        var colour = 'left';
        if (this.props.user === this.props.message.sender) {
            colour = 'right';
        }

        var message = this.props.message.message;
        if (this.props.chat.users.length > 2) {
            message = this.props.message.username + ': ' + this.props.message.message
        }

        var extra_styles = " ";
        if (message.indexOf('./secret') > -1) {
            message = message.replace('./secret', '');
            extra_styles += colour + "-secret";
        }

        message = message.split('&nbsp;').join(' ');
        message = message.split('&lt;').join('<');
        message = message.split('&gt;').join('>');

        message = message.split('<br>').map((text, index) => {
            return <p key={ index }>{ text }</p>
        });

        return (
            <div className={"msg-" + colour} id={this.props.message.id}>
                <div className="bubble">
                    <article className="media">
                        <div className={"msg media-content " + colour + extra_styles} id={this.props.message.id}>
                            {message}
                        </div>
                        <div className="media-right">
                            <a className="time-stamp"><sub className="time-stamp"> <span> {this.props.message.timestamp}</span> </sub></a>
                        </div>
                    </article>
                </div>
            </div>
        );
    }
}