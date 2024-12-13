import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import reviewRoutes from './routes/reviews';
import commentRoutes from './routes/comments';
import path from 'path';

// 환경변수 로드
dotenv.config();
console.log('현재 디렉토리:', __dirname);
console.log('환경변수 확인:', {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
});

// 다른 파일에서 환경변수를 사용하기 전에 여기서 한 번만 검사하도록 수정
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not found in environment variables');
}

const app = express();
const prisma = new PrismaClient();

// DB 연결 확인
async function connectDB() {
  try {
    await prisma.$connect();
    
    // DATABASE_URL 파싱
    const dbUrl = process.env.DATABASE_URL || '';
    const dbInfo = {
      database: dbUrl.split('/').pop()?.split('?')[0],
      host: dbUrl.split('@')[1]?.split(':')[0],
      port: dbUrl.split(':').pop()?.split('/')[0],
      user: dbUrl.split('://')[1]?.split(':')[0]
    };
    
    console.log('데이터베이스 연결 정보:', dbInfo);
    
    // 테이블 목록 확인
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('사용 가능한 테이블:', tables);
    
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
}

// 서버 시작 함수
async function startServer() {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('서버를 시작할 수 없습니다: 데이터베이스 연결 실패');
    return;
  }

  // CORS 설정
  app.use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // 미들웨어 설정
  app.use(express.json());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
  }));

  // Passport 설정
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport 설정 파일 import
  const configurePassport = require('./config/passport').default;
  configurePassport(passport);

  // 라우트 설정
  app.use('/api/auth', authRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/comments', commentRoutes);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

// 서버 시작
startServer().catch(error => {
  console.error('서버 시작 중 오류 발생:', error);
});

// 프로세스 종료 시 DB 연결 해제
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;