import React, { Component } from 'react';
import LeftPane from './LeftPane/LeftPane.js';
import RightPane from './RightPane/RightPane.js';

import axios from 'axios';
import network from './networkHelper.js';

import 'bulma/css/bulma.css';

var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');
var io = sailsIOClient(socketIOClient);
io.sails.url = 'http://api.localhost:1337';

export default class ChatApp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            currChat: null,
            chats: []
        }
    }

    componentDidMount() {
        // Get User & its Chats.
        this.getUser();
        // Get the current Chat if it exists.
        var currChatID  = localStorage.getItem('currChatID');
        if (currChatID) this.openChat(currChatID);
        // Listen for updates.
        io.socket.on('newMessage', (msg) => {
            var chat = this.state.currChat
            // Only update if we are in a chat.
            if (chat != null) {
                // If the message is for this chat.
                if (msg.chat == chat.id) {
                    var msgs = chat.messages;
                    msgs.push(msg);
                    this.setState({
                        messages: msgs
                    });
                }
            }
        });
    }

    // Get current User (and its chats/friends).
    getUser = () => {
        var token       = localStorage.getItem('token');
        network.getCSRF((csrf) => {
            // Get Friends.
            axios({
                method:'POST',
                url:'http://api.localhost:1337/unet/user/get',
                data: {
                  _csrf: csrf,
                  token: token
                },
                withCredentials: true,
                contentType: 'json',
            })
            .then((response) => {
                if (response.data.user) {
                    // Set state.
                    this.setState({
                        user: response.data.user.id
                    });
                }
                if (response.data.user.chats) {
                    // Set state.
                    this.setState({
                        chats: response.data.user.chats
                    });
                    // Subscribe to all the chats.
                    this.state.chats.forEach((chat) => {
                        this.joinChat(chat.id);
                    });
                }
            })
        });
    }

    // Subscribes the socket to a chat.
    joinChat = (chatID) => {
        var token = localStorage.getItem('token');
        io.socket.get('/csrfToken', (res) => {
            var csrf = res._csrf;
            io.socket.headers = {
                "x-csrf-token": csrf,
            };
            io.socket.post('/unet/chat/subscribe', [token, chatID]);
        });
    }

    // Get a Chats info and set the state to load it into the right-pane.
    openChat = (chat) => {
        var token = localStorage.getItem('token');
        network.getCSRF((csrf) => {
            axios({
                method:'POST',
                url:'http://api.localhost:1337/unet/chat/get',
                data: {
                    id: chat.id,
                  _csrf: csrf,
                  token: token
                },
                withCredentials: true,
                contentType: 'json',
            })
            .then((response) => {
                if (response.data.chat) {
                    localStorage.setItem('currChatID', response.data.chat.id)
                    this.setState({
                        currChat: response.data.chat
                    });
                }
            });
        });
    }

    render() {
        return (
            <div className="app">
                <LeftPane  io={io} chats={this.state.chats} user={this.state.user} openChat={this.openChat} />
                <RightPane io={io} chat={this.state.currChat} user={this.state.user} />
            </div>
        );
    }
}