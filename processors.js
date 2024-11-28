const fs = require('fs').promises;
const fsSync = require('fs');

/* 초기 필요한 상수 정의 !! */
const MAX_PLAYERS = 200;
const GAME_ID = '129470';

const DURATION_TIME = 20000;
const TOTAL_THINK_TIME = 4800;

const TIME_OUT = DURATION_TIME + TOTAL_THINK_TIME + 10000;
const FIRST_WAIT_TIME = DURATION_TIME + 10000;

// 카운터 파일 초기화
const COUNTER_FILE = 'thread_counter.txt';
try {
    fsSync.writeFileSync(COUNTER_FILE, '0', 'utf8');
} catch (err) {
    console.error('Failed to initialize counter file:', err);
}

async function incrementCounter() {
    try {
        const currentCount = await fs.readFile(COUNTER_FILE, 'utf8');
        const newCount = parseInt(currentCount) + 1;
        await fs.writeFile(COUNTER_FILE, newCount.toString(), 'utf8');
        return newCount;
    } catch (err) {
        console.error('Error incrementing counter:', err);
        return -1;
    }
}

// 0과 1 사이의 랜덤 소수점 숫자 생성 함수
function getRandomPosition() {
 return [Math.random(), Math.random()];
}

async function checkCounter() {
    try {
        const currentCount = await fs.readFile(COUNTER_FILE, 'utf8');
        return parseInt(currentCount);
    } catch (err) {
        console.error('Error reading counter:', err);
        return -1;
    }
}

function setPlayerName(userContext, events, done) {
    let doneCalled = false;

    incrementCounter().then(count => {
        console.log(`Thread entered setPlayerName. Current count: ${count}`);
    });

    const startedAt = process.hrtime();
    userContext.vars.userId = `${Math.random()}번째 유저`;

    const socket = userContext.sockets[''];
    socket.on('getSelfId', (response) => {
        userContext.vars.myPlayerId = response.playerId; // 전역변수 대신 userContext에 저장

        const playerName = userContext.vars.userId;
        socket.emit('setPlayerName', {
            playerName
        });
    });

    socket.on('setPlayerName', async (response) => {
        const { playerId, playerName } = response;
        if (playerId === userContext.vars.myPlayerId && playerName === userContext.vars.userId) {
            const endedAt = process.hrtime(startedAt);
            const delta = endedAt[0] * 1e9 + endedAt[1];

            events.emit('histogram', 'socketio.response_time.set_player_name', delta / 1e6);
            events.emit('counter', 'total_count.success.set_player_name', 1);

            if (!doneCalled) {
                const waitForPlayers = async () => {
                    const currentCount = await checkCounter();
                    console.log(`Waiting for players... Current count: ${currentCount}`);
                    
                    if (Number(currentCount) >= MAX_PLAYERS) {
                        console.log('All players have joined!');
                        doneCalled = true;
                        return done();
                    } else {
                        // 100ms 후에 다시 체크
                        setTimeout(waitForPlayers, 100);
                    }
                };

                // 첫 체크 시작
                waitForPlayers();
            }
        } 
    });

    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] setPlayerName timed out');
            events.emit('counter', 'total_count.fail.set_player_name', 1);
            doneCalled = true;
            done(new Error('Operation timed out'));
        }
    }, FIRST_WAIT_TIME); 
}

function updatePosition(userContext, events, done) {
    let doneCalled = false;

    // 타이머 시작 
    const startedAt = process.hrtime();
    const socket = userContext.sockets[''];

    const newPosition = getRandomPosition();

    socket.on('updatePosition', (response) => {
        const { playerId, playerPosition } = response;

        if (playerId === userContext.vars.myPlayerId 
            && playerPosition[0] === newPosition[0] 
            && playerPosition[1] === newPosition[1]
        ) {
            // console.log('Successfully updated position:', response);

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

    socket.emit('updatePosition', {
        gameId: GAME_ID,
        newPosition
    });

    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] updatePosition timed out');
            events.emit('counter', 'total_count.fail.update_position', 1);
            doneCalled = true;
            done(new Error('Operation timed out')); // 비정상 종료라도 `done()` 호출
        }
    }, TIME_OUT);
}

function chatMessage(userContext, events, done) {
    let doneCalled = false;
 
    // 타이머 시작
    const startedAt = process.hrtime();
    const socket = userContext.sockets[''];

    const newMessage = `제발 되게 해주세요! 제발!${Math.random()}`;
 
    socket.on('chatMessage', (response) => {
        const { playerId, playerName, message, timestamp } = response;
 
        if (playerId === userContext.vars.myPlayerId 
            && message === newMessage) {
            // console.log('Successfully sent chat message:', response);
 
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
 
    socket.emit('chatMessage', {
        gameId: GAME_ID,
        message: newMessage
    });
 
    setTimeout(() => {
        if (!doneCalled) {
            console.error('[ERROR] chatMessage timed out');
            events.emit('counter', 'total_count.fail.chat_message', 1);
            doneCalled = true;
            done(new Error('Operation timed out')); // 비정상 종료라도 `done()` 호출
        }
    }, TIME_OUT);
}

module.exports = {
    setPlayerName,
    updatePosition,
    chatMessage
};


