const fs = require('fs').promises;
const fsSync = require('fs');

/* 
* 초기 필요한 상수 정의 
*/
const MIN_PLAYERS_FOR_TEST = 190;
const GAME_ID = process.env.GAME_ID;

// TODO: 상수 설정 자동화
const DURATION_TIME = 5000; // game-scenraio.yml duration과 동일하게 설정
const TOTAL_THINK_TIME = 4800; // game-scenario.yml think-time 총합과 동일하게 설정

const TIME_OUT = DURATION_TIME + TOTAL_THINK_TIME + 10000;
const FIRST_WAIT_TIME = DURATION_TIME + 10000;

/* 
* 플레이어가 현재 몇 명 접속했는지 파악하기 위한 파일 관련 함수
*/
const COUNTER_FILE = process.env.COUNTER_FILE;

try {
    fsSync.writeFileSync(COUNTER_FILE, '0', 'utf8');
} catch (err) {
    console.error('파일 읽기 실패:', err);
}

async function incrementCounter() {
    try {
        const currentCount = await fs.readFile(COUNTER_FILE, 'utf8');
        const newCount = parseInt(currentCount) + 1;
        await fs.writeFile(COUNTER_FILE, newCount.toString(), 'utf8');
        return newCount;
    } catch (err) {
        console.error('카운트 증가 실패:', err);
        return -1;
    }
}

async function checkCounter() {
    try {
        const currentCount = await fs.readFile(COUNTER_FILE, 'utf8');
        return parseInt(currentCount);
    } catch (err) {
        console.error('카운트 읽기 실패:', err);
        return -1;
    }
}

/* 
* 본격적인 테스트를 위한 함수들
*/
function getRandomPosition() {
 return [Math.random(), Math.random()];
}

function setPlayerName(userContext, events, done) {
    let doneCalled = false;

    incrementCounter();

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
                    console.log(`플레이어들을 기다리는 중... 현재 접속 인원: ${currentCount}명`);
                    
                    if (Number(currentCount) >= MIN_PLAYERS_FOR_TEST) {
                        console.log(`${currentCount}명의 플레이어가 접속했습니다. 테스트를 시작합니다!`);
                        doneCalled = true;
                        return done();
                    } else {
                        setTimeout(waitForPlayers, 500);
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
            done(new Error('Operation timed out'));
        }
    }, TIME_OUT);
}

function chatMessage(userContext, events, done) {
    let doneCalled = false;
 
    // 타이머 시작
    const startedAt = process.hrtime();
    const socket = userContext.sockets[''];

    const newMessage = `이것은 플레이어가 보내는 고유한 메시지입니다! ${Math.random()}`;
 
    socket.on('chatMessage', (response) => {
        const { playerId, playerName, message, timestamp } = response;
 
        if (playerId === userContext.vars.myPlayerId 
            && message === newMessage) {
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
            done(new Error('Operation timed out')); 
        }
    }, TIME_OUT);
}

module.exports = {
    setPlayerName,
    updatePosition,
    chatMessage
};
