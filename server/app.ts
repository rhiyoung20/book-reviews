import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import cors from 'cors';
import connectDB from './config/database';  // { connectDB }가 아닌 default import 사용
import pool from './config/database';
import config from './config/config';
import authRoutes from './routes/auth';
import reviewRoutes from './routes/reviews';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';
import sequelize from './config/database';
import session from 'express-session';
import RedisStore from 'connect-redis'
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// 환경 변수 출력 (디버깅 용도)
console.log('Environment Variables:');
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

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

// Redis 클라이언트 설정
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Redis 연결 에러 로깅
redisClient.on('error', err => console.log('Redis Client Error', err));

// Redis 연결
redisClient.connect().catch(console.error);

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'ptgoras916=25',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    },
    store: new (RedisStore as any)({ 
        client: redisClient
    })
}));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', commentRoutes);
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
const PORT = Number(config.port) || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL 연결 성공');
    
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('MySQL 연결 실패:', error);
    process.exit(1);
  }
};

startServer();

export default app;