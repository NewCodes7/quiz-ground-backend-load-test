const { io } = require('socket.io-client');
const fs = require('fs');

// Socket.IO 클라이언트 생성
const socket = io('https://quizground.duckdns.org:3333/game', {
    query: {
        "create-room": "title=test;gameMode=RANKING;maxPlayerCount=210;isPublic=true"
    }
});

// 연결 이벤트 핸들러
socket.on('connect', () => {
    // // createRoom 이벤트 발생
    // socket.emit('createRoom', {
    //     title: "aaaa",
    //     gameMode: "RANKING",
    //     maxPlayerCount: 200,
    //     isPublic: true
    // });
});

// createRoom 응답 수신
socket.on('createRoom', (response) => {
    if (response) {
        // gameId를 파일에 저장
        fs.writeFileSync('gameId.txt', response.gameId.toString());
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