import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import cors from 'cors';
import { connectDB } from './config/database';
import config from './config/config';
import authRoutes from './routes/auth';
import reviewRoutes from './routes/reviews';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';

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

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
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
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`서버 주소: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

export default app;