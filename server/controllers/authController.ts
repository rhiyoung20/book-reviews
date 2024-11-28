import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import config from '../config/config';

// 사용자 인터페이스 정의
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 관리자 계정 확인 추가
    const isAdminLogin = email === process.env.ADMIN_USERNAME && 
                        password === process.env.ADMIN_PASSWORD;

    if (isAdminLogin) {
      // 관리자 로그인 처리
      const token = jwt.sign(
        { 
          id: 0, // 관리자 특별 ID
          username: 'admin',
          isAdmin: true 
        },
        config.jwtSecret,
        { expiresIn: '1d' }
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

    // 사용자 조회
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.SELECT,
        plain: true // 단일 결과 반환
      }
    ) as unknown as User[];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        isAdmin: user.isAdmin 
      },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
};

// 이메일 인증 인터페이스
interface EmailVerification {
  email: string;
  verification_code: string;
  is_verified: boolean;
}

// 이메일 인증
export const verifyEmail = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { email, verificationCode } = req.body;

    // 인증 코드 확인
    const [verification] = await sequelize.query(
      'SELECT * FROM email_verifications WHERE email = ? AND verification_code = ?',
      {
        replacements: [email, verificationCode],
        type: QueryTypes.SELECT
      }
    );

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 인증 코드입니다.'
      });
    }

    // 인증 상태 업데이트
    await sequelize.query(
      'UPDATE email_verifications SET is_verified = true WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.UPDATE,
        transaction: t
      }
    );

    await t.commit();
    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다.'
    });

  } catch (error) {
    await t.rollback();
    console.error('이메일 인증 오류:', error);
    res.status(500).json({
      success: false,
      message: '이메일 인증 처리 중 오류가 발생했습니다.'
    });
  }
};

// 사용자명 중복 체크
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    const [result] = await sequelize.query(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      {
        replacements: [username],
        type: QueryTypes.SELECT
      }
    );

    // count 값 추출
    const count = (result as any).count;
    
    res.json({
      success: true,
      available: count === 0,
      count: count,
      message: count === 0 ? '사용 가능한 사용자명입니다.' : '이미 사용 중인 사용자명입니다.'
    });
  } catch (error) {
    console.error('사용자명 중복 체크 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자명 중복 체크 중 오류가 발생했습니다.'
    });
  }
};

// 인증 상태 확인
export const verifyAuth = async (req: Request, res: Response) => {
  try {
    // 이미 authenticateToken 미들웨어를 통과했다면 인증된 상태
    const user = (req as any).user;  // CustomRequest 타입 사용
    
    res.json({
      success: true,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('인증 확인 오류:', error);
    res.status(401).json({
      success: false,
      message: '인증에 실패했습니다.'
    });
  }
};