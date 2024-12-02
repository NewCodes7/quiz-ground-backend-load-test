const { createRoom } = require('./create-room.js');

async function initializeRooms() {
    try {
        const rooms = await Promise.all([
            createRoom(),
            createRoom(),
        ]);
        
        console.log('모든 게임방 생성 완료:', rooms.map(r => r.gameId));
        
        // 각 방의 gameId를 파일에 저장
        const gameIds = rooms.map(r => r.gameId);
        
        // 연결 유지를 위한 이벤트 리스너들
        rooms.forEach(({ socket, gameId }) => {
            socket.on('disconnect', () => {
                console.log(`방 ${gameId} 연결 끊김. 재연결 시도 중...`);
            });

            socket.on('connect', () => {
                console.log(`방 ${gameId} 연결됨`);
            });
        });

        // 프로세스가 종료되지 않도록 유지
        process.on('SIGINT', () => {
            console.log('서버 종료 중...');
            rooms.forEach(({ socket, gameId }) => {
                socket.disconnect();
                console.log(`방 ${gameId} 연결 종료`);
            });
            process.exit(0);
        });

        // 주기적으로 연결 상태 확인
        setInterval(() => {
            rooms.forEach(({ socket, gameId }) => {
                if (socket.connected) {
                    console.log(`방 ${gameId} 정상 연결 중`);
                } else {
                    console.log(`방 ${gameId} 연결 끊김 상태`);
                }
            });
        }, 30000);

    } catch (error) {
        console.error('방 생성 중 오류 발생:', error);
        process.exit(1);
    }
}

initializeRooms();