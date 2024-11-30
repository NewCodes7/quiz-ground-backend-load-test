const { io } = require('socket.io-client');
const fs = require('fs');

const socket = io('https://quizground.duckdns.org:3333/game', {
    query: {
        "create-room": "title=test;gameMode=RANKING;maxPlayerCount=210;isPublic=true"
    }
});

socket.on('createRoom', (response) => {
    if (response) {
        console.log('Successfully saved gameId:', response);
    } else {
        console.error('No gameId in response');
    }
});

socket.on('getSelfId', (response) => {
    socket.emit('setPlayerName', {
        playerName: "hyeok"
    });
})