import { Request, Response, Router, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../models';

// AuthUser 타입 정의
interface AuthUser {
  id: number;
  username: string;
  isAdmin?: boolean;
  googleId?: string;
  kakaoId?: string;
}

// Request 타입 확장
interface RequestWithUser extends Request {
  user?: AuthUser;
}

const router = Router();

// JWT 토큰 생성 함수
const generateToken = (user: AuthUser) => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.isAdmin },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
};

// Google OAuth
router.get('/google', 
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Google 로그인 요청 받음');
    const { username } = req.query;
    if (username && req.session) {
      req.session.pendingUsername = username as string;
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: Math.random().toString(36).substring(7)
  })
);

// Google 콜백
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as AuthUser;
      if (!user) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const token = generateToken(user);
      const username = encodeURIComponent(user.username);

      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${username}&status=success`
      );
    } catch (error) {
      console.error('Google 콜백 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL}/?error=로그인_처리_중_오류가_발생했습니다`);
    }
  }
);

// Kakao OAuth
router.get('/kakao', 
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Kakao 로그인 요청 받음');
    next();
  },
  passport.authenticate('kakao', {
    state: Math.random().toString(36).substring(7)
  })
);

// Kakao 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as AuthUser;
      if (!user) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const token = generateToken(user);
      const username = encodeURIComponent(user.username);

      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${username}&status=success`
      );
    } catch (error) {
      console.error('Kakao 콜백 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL}/?error=로그인_처리_중_오류가_발생했습니다`);
    }
  }
);

// 상태 저장
router.post('/set-state', (req: Request, res: Response) => {
  try {
    const { state } = req.body;
    if (!state || !req.session) {
      return res.status(400).json({ success: false, message: 'state is required' });
    }
    req.session.pendingUsername = state;
    res.json({ success: true });
  } catch (error) {
    console.error('상태 저장 오류:', error);
    res.status(500).json({ success: false, message: '상태 저장 중 오류가 발생했습니다.' });
  }
});

// 사용자명 중복 확인
router.post('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    console.log('서버 수신된 username:', username);

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '사용자명이 필요합니다.'
      });
    }

    const existingUser = await User.findOne({
      where: { username }
    });
    
    return res.json({
      success: true,
      exists: !!existingUser
    });
  } catch (error) {
    console.error('사용자명 중복 확인 오류:', error);
    return res.status(500).json({
      success: false,
      message: '사용자명 확인 중 오류가 발생했습니다.'
    });
  }
});

// 회원가입
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (req.session) {
      req.session.pendingUsername = username;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '오류가 발생했습니다.' });
  }
});

// Kakao 콜백 테스트
router.get('/oauth/kakao/callback', (req: Request, res: Response) => {
  const { state } = req.query;
  if (req.session) {
    req.session.pendingUsername = state as string;
  }
  res.json({ success: true });
});

export default router;