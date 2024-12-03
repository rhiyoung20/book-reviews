import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import cors from 'cors';
import connectDB from './config/database';  // { connectDB }가 아닌 default import 사용
import pool from './config/database';
import config from './config/config';
import authRoutes from './routes/auth';
import reviewRoutes from './routes/reviews';
import commentRouter from './routes/comments';
import userRoutes from './routes/users';
import sequelize from './config/database';
import session from 'express-session';
import * as connectRedis from 'connect-redis';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import './models/User';  // User 모델 임포트
import './models/emailVerification';  // 추가
  
dotenv.config();

// 환경 변수 출력 (디버깅 용도)
console.log('Environment Variables:');
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS?.substring(0, 4) + '...'); // 보안을 위해 일부만 출력

const app = express();

// CORS 설정 수정
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RedisStore = connectRedis.default(session);

// Redis 설정을 함수로 분리
const setupRedis = async () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', err => console.log('Redis Client Error', err));
  await redisClient.connect();

  app.use(session({
    store: new RedisStore({ 
      client: redisClient as any,
      prefix: "myapp:", 
    }),
    secret: process.env.SESSION_SECRET || 'ptgoras916=25',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true
    }
  }));
};

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRouter);
app.use('/users', userRoutes);

// 에러 핸들링
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '서버 오류가 발생했습니다.' 
  });
});

// 서버 시작
const PORT = Number(process.env.PORT) || 4000;

// 서버 시작 함수 수정
const startServer = async () => {
  try {
    await setupRedis();
    await sequelize.authenticate();
    console.log('PostgreSQL 연결 성공');
    
    await sequelize.sync({ alter: true });
    console.log('데이터베이스 테이블 동기화 완료');

    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`포트 ${PORT}가 이미 사용 중입니다. 다른 포트로 시도합니다...`);
        app.listen(0, () => {  // 0을 지정하면 사용 가능한 랜덤 포트를 할당
          const addr = app.listen().address();
          const actualPort = typeof addr === 'string' ? addr : addr?.port;
          console.log(`서버가 포트 ${actualPort}에서 실행 중입니다.`);
        });
      } else {
        console.error('서버 시작 오류:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
};

startServer();

export default app;