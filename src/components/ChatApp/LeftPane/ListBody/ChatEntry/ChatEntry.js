import React, { Component } from 'react';

import './ChatEntry.css';

import axios from 'axios';
import network from './networkHelper.js';

export default class FriendEntry extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            chat: null
        }
    }

    openChat = () => {
        this.props.openChat(this.props.data)
    }

    // Get the chat and connect to the chat socket.
    componentDidMount() {
        var token = localStorage.getItem('token')
        network.getCSRF((csrf) => {
            axios({
                method:'POST',
                url:'http://api.localhost:1337/unet/chat/get',
                data: {
                  _csrf: csrf,
                  token: token,
                  id: this.props.data.id
                },
                withCredentials: true,
                contentType: 'json',
            })
            .then((response) => {
                if (response.data.chat) {
                    this.setState({
                        chat: response.data.chat
                    });
                }
                
            })
        });
        // Listen for updates.
        const { io } = this.props;
        io.socket.on('newMessage', (msg) => {
            var chat = this.state.chat;
            // If the message is for this chat.
            if (msg.chat == chat.id) {
                if (chat.last_sender == null) {
                    var temp_sender = { id: null }
                    chat.last_sender = temp_sender;
                }
                chat.last_sender.id = msg.sender;
                chat.last_active = msg.timestamp;
                chat.last_msg = msg.message;
                this.setState({
                    chat: chat
                });
            }
        });
    }

    render() {
        
        var chatName    = 'Loading...';
        var colour      = 'left';
        var message     = '';
        var lastActive  = ''; 


        if (this.state.chat) {

            // Shorten chat name to fit in panel.
            chatName = this.state.chat.name;
            if (chatName.length > 19) {
                chatName = chatName.substring(0, 16);
                chatName += '...';
            }

            // Determine colour/side of last_msg.
            var colour = 'left';
            if (this.state.chat.last_sender) {
                // alert(this.state.chat.last_sender.id + ' == ' +  this.props.user)
                if (this.state.chat.last_sender.id == this.props.user) {
                    colour = 'right';
                }
            }

            // Shorten last_msg if necessary
            var message = this.state.chat.last_msg;
            if (message.length > 25) {
                message = message.substring(0, 22);
                message += '...';
            }

            if (this.state.chat.users.length > 2) {
                if (this.state.chat.last_sender) {
                    message = this.state.chat.last_sender.username + ': ' + message;
                }
            }

            lastActive = this.state.chat.last_active
        }

        return (
            <div className="chatEntry" key={this.props.data.id} id={this.props.data.id} onMouseDown={this.openChat}>
                <div className="chatAvatar">
                    <img src="http://bulma.io/images/placeholders/64x64.png" alt="Image" />
                </div>
                <div className="chatTimestamp">
                        {lastActive}
                    </div>
                <div className="friendContent">
                    <div className="contentTop">
                        {chatName}
                    </div>
                    
                    <div className={"contentBot " + colour}>
                        {message}
                    </div>
                </div>
            </div>
        );
    }
}