## 📍 소개

- 해당 프로젝트는 [QuizGround](https://github.com/boostcampwm-2024/web10-boostproject) 백엔드 소켓 서버를 부하테스트 하기 위한 저장소입니다. 

## 📝 파일 설명

1. `game-scenario.yml`
   1. artillery가 실행해주는 게임 시나리오 yml 파일 
   2. npm run init을 통해 실행
2. `processors.js`
   1. artillery에서 지원하는 커스텀 함수 기능으로 함수 작성
   2. 이벤트 보내는 함수 직접 작성하여 원하는 타이밍 조절
3. `create-room.js`
   1. 부하테스트할 초기 게임방 설정해주는 파일 
   2. npm run start를 통해 실행 

## 🚀 사용 방법 

> 가장 먼저 Artillery 준비! `npm install artillery`

```bash
        ___         __  _ ____
  _____/   |  _____/ /_(_) / /__  _______  __ ___
 /____/ /| | / ___/ __/ / / / _ \/ ___/ / / /____/
/____/ ___ |/ /  / /_/ / / /  __/ /  / /_/ /____/
    /_/  |_/_/   \__/_/_/_/\___/_/   \__  /
                                    /____/


VERSION INFO:

Artillery: 2.0.21
Node.js:   v20.15.1
OS:        darwin
```

1. git clone 해당 리포지토리
2. `npm install`
3. 터미널을 두 개 준비 (1번 터미널, 2번 터미널)
4. 1번 터미널에서 `npm run init:dev`
5. 필요한 초기 상수 설정 점검 (GAMEID, 게임 인원 등)
6. 2번 터미널에서 `npm run start:dev`
7. 테스트 지켜보기
   1. 중간에 NaN이 뜨면 재실행

## 📚 관련 문서

- [Artillery를 통한 Socket.io 게임 서버 부하테스트 경험기](https://newcodes.tistory.com/entry/Nodejs-Socketio-%EA%B2%8C%EC%9E%84-%EC%84%9C%EB%B2%84-%EB%B6%80%ED%95%98%ED%85%8C%EC%8A%A4%ED%8A%B8-%EA%B2%BD%ED%97%98%EA%B8%B0%EC%99%80-TIP-feat-Artillery)
- [Artillery 공식 문서 중 Socket.io](https://www.artillery.io/docs/reference/engines/socketio)
- [Socket.io 공식 문서 중 Artillery](https://socket.io/docs/v4/load-testing/)
