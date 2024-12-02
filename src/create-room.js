const { io } = require('socket.io-client');

/* 
* 초기 필요한 상수 정의 
*/
const GAME_OPTION = "title=test;gameMode=RANKING;maxPlayerCount=210;isPublic=true";
const TARGET = process.env.TARGET || 'http://localhost:3000/game';

async function createRoom() {
    return new Promise((resolve, reject) => {
        const socket = io(TARGET, {
            query: {
                "create-room": GAME_OPTION
            }
        });

        socket.on('createRoom', (response) => {
            if (response) {
                console.log('Successfully saved gameId:', response);
                
                socket.on('getSelfId', (selfResponse) => {
                    socket.emit('setPlayerName', {
                        playerName: `Host-${selfResponse.playerId}`
                    });
                });

                resolve({ socket, gameId: response });
            } else {
                reject('No gameId in response');
            }
        });

        socket.on('error', (error) => {
            reject(error);
        });
    });
}

createRoom();

module.exports = { createRoom };