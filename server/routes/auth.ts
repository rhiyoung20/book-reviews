import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { checkUsername } from '../controllers/authController';
import { sendVerification, verifyEmail } from '../controllers/emailVerificationController';

const router = express.Router();

// 미들웨어 함수 수정
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 라우트 설정
router.post('/check-username', checkUsername);
router.post('/send-verification', sendVerification);
router.post('/verify-email', verifyEmail);

export default router;