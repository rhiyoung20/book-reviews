import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import config from './config/config';
import router from './routes';
import sequelize from './models';
import commentRouter from './routes/comments';

// Passport 설정 파일 import (가장 먼저 해야 함)
import './config/passport';

const app = express();

// 세션 설정 (Passport 초기화 전에 필요)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://accounts.google.com', 'https://kauth.kakao.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport 미들웨어 설정
app.use(passport.initialize());
app.use(passport.session());

// API 라우트
app.use('/api', router);
app.use('/api/comments', commentRouter);

// 라우트 연결 확인을 위한 로그
console.log('All registered routes:', 
  app._router.stack
    .filter((r: any) => r.route)
    .map((r: any) => r.route.path)
);

// 404 에러 처리
app.use((req, res) => {
  console.error('404 에러:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: '요청하신 경로를 찾을 수 없습니다.'
  });
});

// 에러 처리 미들웨어
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.'
  });
});

export default app;