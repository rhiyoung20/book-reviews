import express from 'express';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth';
import './config/passport';  // passport 설정 임포트
import session from 'express-session';
import config from './config/config';
import reviewsRouter from './routes/reviews';

const app = express();

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// 미들웨어
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 라우트
app.use('/api/auth', authRoutes);  // auth 라우터 등록
app.use('/api/reviews', reviewsRouter);

export default app;