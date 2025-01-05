// 초기에 게임방 하나를 만들기 위한 파일
const { io } = require('socket.io-client');
const fs = require('fs');

const GAME_OPTION = "title=test;gameMode=RANKING;maxPlayerCount=210;isPublic=true";

const socket = io(process.env.TARGET, {
    query: {
        "create-room": GAME_OPTION
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