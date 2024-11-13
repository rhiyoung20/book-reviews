import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config';
import sequelize from '../config/database';
import { checkUsername } from '../controllers/authController';
import { sendVerification, verifyEmail } from '../controllers/emailVerificationController';
import { QueryTypes } from 'sequelize';

const router = express.Router();

// 미들웨어 함수
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
router.post('/signup', async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { username, email, password, phone } = req.body;

    // 이메일 인증 상태 확인
    const [verifications] = await sequelize.query(
      'SELECT * FROM email_verifications WHERE email = ? AND is_verified = true',
      {
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );

    if (!verifications || !Array.isArray(verifications) || verifications.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일 인증이 필요합니다.' 
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await sequelize.query(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      {
        replacements: [username, email, hashedPassword, phone],
        type: QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    res.status(201).json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.' 
    });
  } catch (error) {
    await t.rollback();
    console.error('회원가입 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '회원가입 처리 중 오류가 발생했습니다.' 
    });
  }
});

export default router;