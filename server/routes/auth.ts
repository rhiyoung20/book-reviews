import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { sendVerification, verifyEmail as verifyEmailController } from '../controllers/emailVerificationController';
import { CustomRequest } from '../middleware/auth';
import { generateTempPassword, sendTempPasswordEmail } from '../utils/email';
import { 
  login, 
  verifyEmail, 
  checkUsername,
  verifyAuth  // 추가
} from '../controllers/authController';
import { verifyToken } from '../middleware/auth';  // 이걸로 통일
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// JWT 시크릿 키 설정
const JWT_SECRET = process.env.JWT_SECRET || 'ptgoras916=25';

// 환경 변수 출력 (디버깅 용도)
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);

// 사용자명 중복 체크
router.post('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    console.log('Checking username:', username); // 디버깅 로그 추가
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: '사용자명이 제공되지 않았습니다.'
      });
    }

    const [result] = await sequelize.query(
      'SELECT COUNT(*) as count FROM users WHERE username = :username',
      {
        replacements: { username },
        type: QueryTypes.SELECT
      }
    );

    const count = (result as any).count;
    console.log('Username check result:', count); // 디버깅 로그 추가
    
    res.json({
      success: true,
      exists: count > 0,
      message: count > 0 ? '이미 사용 중인 사용자명입니다.' : '사용 가능한 사용자명입니다.'
    });
  } catch (error) {
    console.error('사용자명 중복 체크 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자명 확인 중 오류가 발생했습니다.'
    });
  }
});

// 이메일 인증 메일 발송
router.post('/send-verification', sendVerification);

// 이메일 인증 확인
router.post('/verify-email', verifyEmailController);

// 회원가입
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone } = req.body;
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      `INSERT INTO users (
        username, 
        email, 
        password, 
        phone
      ) VALUES (
        :username,
        :email,
        :password,
        :phone
      )`,
      {
        replacements: { username, email, password: hashedPassword, phone },
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.' 
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '회원가입 처리 중 오류가 발생했습니다.' 
    });
  }
});

// 로그인
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 관리자 계정 확인을 먼저 수행
    if (email === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      console.log('관리자 로그인 시도');
      const token = jwt.sign(
        { 
          id: 0,
          username: 'admin',
          isAdmin: true 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: 0,
          username: 'admin',
          email: process.env.ADMIN_USERNAME,
          isAdmin: true
        }
      });
    }

    // 일반 사용자 로그인 로직은 그 다음에 실행
    console.log('로그인 시도:', { email });
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    console.log('조회된 사용자:', user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, (user as any).password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const token = jwt.sign(
      { 
        id: (user as any).id, 
        username: (user as any).username,
        isAdmin: false
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: (user as any).id,
        username: (user as any).username,
        email: (user as any).email,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 비밀번호 찾기
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('받은 이메일:', email); // 디버깅용 로그 추가

    // 사용자 확인 쿼리 수정 (users로 테이블명 수정)
    const [results] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    console.log('조회 결과:', results); // 디버깅용 로그 추가

    if (!results) {
      return res.status(404).json({
        success: false,
        message: '해당 이메일로 등록된 사용자를 찾을 수 없습니다.'
      });
    }

    // 임시 비밀번호 생성
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // DB에 임시 비밀번호 저장 (users로 테이블명 수정)
    await sequelize.query(
      'UPDATE users SET password = :password WHERE email = :email',
      {
        replacements: { password: hashedPassword, email },
        type: QueryTypes.UPDATE
      }
    );

    // 이메일로 임시 비밀번호 전송
    await sendTempPasswordEmail(email, tempPassword);

    res.json({
      success: true,
      message: '임시 비밀번호가 이메일로 발송되었습니다.'
    });

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 재설정 중 오류가 발생했습니다.'
    });
  }
});

// 인증 상태 확인 엔드포인트 추가
router.get('/verify', verifyToken, verifyAuth);

export default router;