import app from './app';
import sequelize from './config/database';
import config from './config/config';

const port = config.port;

// 데이터베이스 연결 확인
sequelize.authenticate()
  .then(() => {
    console.log('데이터베이스 연결 성공');
    
    // 서버 시작
    app.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  })
  .catch((error: Error) => {
    console.error('데이터베이스 연결 실패:', error);
  }); 