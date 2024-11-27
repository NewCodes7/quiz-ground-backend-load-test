let myPlayerId;

// 0과 1 사이의 랜덤 소수점 숫자 생성 함수
function getRandomPosition() {
 return [Math.random(), Math.random()];
}

function setPlayerName(userContext, events, done) {
    let doneCalled = false;

    userContext.vars.gameId = "636255";
    // 타이머 시작 
    const startedAt = process.hrtime();

    userContext.vars.userId = `${Math.random()}번째 유저`;

    const socket = userContext.sockets[''];
    socket.on('getSelfId', (response) => {
        myPlayerId = response.playerId;
        userContext.vars.myPlayerId = myPlayerId;

        const playerName = userContext.vars.userId;
        socket.emit('setPlayerName', {
            playerName
        });
    });

    socket.on('setPlayerName', (response) => {
        const { playerId, playerName } = response;
        if (playerId === myPlayerId && playerName === userContext.vars.userId) {
            console.log('Successfully set player name:', response)
            
            // 타이머 끝 
            const endedAt = process.hrtime(startedAt);
            const delta = endedAt[0] * 1e9 + endedAt[1];

            events.emit('histogram', 'socketio.response_time.set_player_name', delta / 1e6);
            events.emit('counter', 'total_count.success.set_player_name', 1);


            if (!doneCalled) {
                doneCalled = true;
                return done();
            }
        } 
    });

    // 타임아웃 설정 (10초 제한)
    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] setPlayerName timed out');
            events.emit('counter', 'total_count.fail.set_player_name', 1);
            doneCalled = true;
            done(new Error('Operation timed out')); // 비정상 종료라도 `done()` 호출
        }
    }, 10000);
}

function updatePosition(userContext, events, done) {
    let doneCalled = false;

    // 타이머 시작 
    const startedAt = process.hrtime();
    const socket = userContext.sockets[''];

    socket.on('updatePosition', (response) => {
        const { playerId, playerPosition } = response;

        if (playerId === myPlayerId && playerPosition[0] === userContext.vars.position[0] && playerPosition[1] === userContext.vars.position[1]) {
            console.log('Successfully updated position:', response);

            // 타이머 끝 
            const endedAt = process.hrtime(startedAt);
            const delta = endedAt[0] * 1e9 + endedAt[1];

            events.emit('histogram', 'socketio.response_time.update_position', delta / 1e6);
            events.emit('counter', 'total_count.success.update_position', 1);

            if (!doneCalled) {
                doneCalled = true;
                return done();
            }
        }
    })

    const newPosition = getRandomPosition();
    userContext.vars.position = newPosition;

    socket.emit('updatePosition', {
        gameId: userContext.vars.gameId,
        newPosition
    });

    // 타임아웃 설정 (10초 제한)
    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] updatePosition timed out');
            events.emit('counter', 'total_count.fail.update_position', 1);
            doneCalled = true;
            done(new Error('Operation timed out')); // 비정상 종료라도 `done()` 호출
        }
    }, 10000);
}

function chatMessage(userContext, events, done) {
    let doneCalled = false;
 
    // 타이머 시작
    const startedAt = process.hrtime();
    const socket = userContext.sockets[''];
 
    socket.on('chatMessage', (response) => {
        const { playerId, playerName, message, timestamp } = response;
 
        if (playerId === myPlayerId && message === userContext.vars.message) {
            console.log('Successfully sent chat message:', response);
 
            // 타이머 끝
            const endedAt = process.hrtime(startedAt);
            const delta = endedAt[0] * 1e9 + endedAt[1];
 
            events.emit('histogram', 'socketio.response_time.chat_message', delta / 1e6);
            events.emit('counter', 'total_count.success.chat_message', 1);
 
            if (!doneCalled) {
                doneCalled = true;
                return done();
            }
        }
    });
 
    const message = '제발 되게 해주세요! 제발!';
    userContext.vars.message = message;
 
    socket.emit('chatMessage', {
        gameId: userContext.vars.gameId,
        message
    });
 
    // 타임아웃 설정 (10초 제한)
    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] chatMessage timed out');
            events.emit('counter', 'total_count.fail.chat_message', 1);
            doneCalled = true;
            done(new Error('Operation timed out')); // 비정상 종료라도 `done()` 호출
        }
    }, 10000);
 }

module.exports = {
    setPlayerName,
    updatePosition,
    chatMessage
};


