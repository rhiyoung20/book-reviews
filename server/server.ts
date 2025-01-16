import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import sequelize from './models';
import routes from './routes';
import passport from 'passport';
import passportConfig from './config/passport';
import session from 'express-session';
import app from './app';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 4000;

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'], // 또는 '*'
  credentials: true,
}));

// 루트 경로 ("/")에 대한 GET 요청 처리
app.get('/', (req, res) => {
  res.send('Hello, World!'); // 또는 res.sendFile() 등을 사용하여 HTML 파일 제공
});

// ... (생략) ...

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // 데이터베이스 연결
  sequelize.sync()
    .then(() => {
      console.log('데이터베이스 연결 성공');
    })
    .catch((error: Error) => {
      console.error('데이터베이스 연결 실패:', error);
    });
});