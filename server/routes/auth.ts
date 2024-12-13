import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../config/config';
import { CustomRequest } from '../types/auth';
import { Session } from 'express-session';
import { Strategy as GoogleStrategy, VerifyCallback, Profile } from 'passport-google-oauth20';

// 세션 타입 확장
declare module 'express-session' {
  interface Session {
    state?: string;
  }
}

const router = express.Router();

// 새 사용자용 타입 정의
type NewSocialUser = {
  socialId: string;
  isNewUser: boolean;
};

// 환경변수 확인 및 Passport 설정
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not configured. Social login will be disabled.');
}

// JWT 토큰 생성 함수
const generateToken = (user: { id: number; username: string; isAdmin: boolean }) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      isAdmin: user.isAdmin 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

// 에러 응답 헬퍼 함수 추가
const sendError = (res: Response, status: number, message: string) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// 사용자명 중복 확인
router.post('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) {
      return sendError(res, 400, '사용자명이 필요합니다.');
    }
    
    console.log('사용자명 중복 확인 요청:', username);
    
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    res.json({
      success: true,
      exists: !!existingUser
    });
  } catch (error) {
    console.error('사용자명 확인 오류:', error);
    return sendError(res, 500, '사용자명 확인 중 오류가 발생했습니다.');
  }
});

// Google 로그인 시작
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// username 상태 저장
router.post('/set-state', (req: Request, res: Response) => {
  try {
    const { state } = req.body;
    if (req.session) {
      req.session.state = state;
      console.log('세션 저장 완료:', state);
      res.json({ success: true });
    } else {
      throw new Error('세션이 초기화되지 않았습니다.');
    }
  } catch (error) {
    console.error('상태 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '상태 저장 중 오류가 발생했습니다.'
    });
  }
});

// Google 로그인 콜백
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=social_account_exists` 
  }),
  async (req: Request, res: Response) => {
    try {
      console.log('인증 후 콜백 진입');
      const user = (req as CustomRequest).user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // JWT 토큰 생성 전에 JWT_SECRET 확인
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_config_error`);
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // 성공 시 토큰과 함께 홈페이지로 리다이렉트
      return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}&username=${user.username}&status=success`);
    } catch (error) {
      console.error('Google 콜백 처리 오류:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// 소셜 회원가입 완료
router.post('/complete-social-signup', async (req: Request, res: Response) => {
  try {
    const { username, socialId } = req.body;

    // username 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 필명입니다.'
      });
    }

    // 새 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        socialId,
        socialType: 'google',
        isAdmin: false
      }
    });

    // 토큰 생성
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      username: user.username
    });
  } catch (error) {
    console.error('소셜 회원가입 완료 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
});

// 관리자 로그인
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          id: 0,
          username: 'admin',
          isAdmin: true 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          username: 'admin',
          isAdmin: true
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: '관리자 인증에 실패했습니다.'
    });
  } catch (error) {
    console.error('관리자 로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 인증 상태 확인
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 없습니다.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    res.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        isAdmin: decoded.isAdmin
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
  passReqToCallback: true
}, async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    const username = req.session?.state;
    console.log('Session username:', username);

    // 기존 사용자 확인
    let user = await prisma.user.findFirst({
      where: {
        socialId: profile.id,
        socialType: 'google'
      }
    });

    if (user) {
      // 기존 사용자가 있는데 username이 다르다면 에러 처리
      if (user.username !== username) {
        console.log('소셜 계정 중복 에러:', {
          existingUsername: user.username,
          attemptedUsername: username
        });
        return done(null, false, { 
          message: '이미 다른 사용자가 사용 중인 소셜 계정입니다.' 
        });
      }
      return done(null, user);
    }

    // 새 사용자 생성 로직...
  } catch (error) {
    console.error('Google OAuth 상세 에러:', error);
    return done(error as Error);
  }
}));

export default router;