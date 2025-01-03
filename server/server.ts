import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // DB 연결 시도
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 필요한 경우 DB 동기화
    await sequelize.sync();
    console.log('데이터베이스 동기화 완료');

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer(); 