import { Sequelize } from 'sequelize';
import config from './config';

const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+09:00' // 한국 시간대 설정
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 개발 환경에서만 sync 실행
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('모델 동기화 완료');
    }
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  }
};

export default sequelize;