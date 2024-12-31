import { Request, Response, Router, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../models';
import { RequestWithUser } from '../types/auth';

const router = Router();

// JWT 토큰 생성 함수
const generateToken = (user: Express.User) => {
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
  passport.authenticate('google', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      if (!user || !user.username) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // username으로 사용자 재조회
      const verifiedUser = await User.findOne({
        where: { username: user.username }
      });

      if (!verifiedUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const token = generateToken(verifiedUser);
      console.log('생성된 토큰:', token);

      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${encodeURIComponent(verifiedUser.username)}&status=success`
      );
    } catch (error) {
      console.error('Google 콜백 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Kakao OAuth
router.get('/kakao', 
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Kakao 로그인 요청 받음');
    const { username } = req.query;
    if (username && req.session) {
      req.session.pendingUsername = username as string;
      console.log('세션에 username 저장됨:', username);
    }
    next();
  },
  passport.authenticate('kakao', {
    state: Math.random().toString(36).substring(7)
  })
);

// Kakao 콜백 (하나로 통합)
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      if (!user) {
        console.error('카카오 콜백: 사용자 정보 없음');
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // username으로 사용자 재조회 (Google 로그인과 동일한 방식)
      const verifiedUser = await User.findOne({
        where: { username: user.username }
      });

      if (!verifiedUser) {
        console.error('카카오 콜백: 사용자 검증 실패');
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const token = generateToken(verifiedUser);
      console.log('카카오 로그인 성공:', { 
        username: verifiedUser.username,
        hasToken: !!token 
      });
      
      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${encodeURIComponent(verifiedUser.username)}&status=success`
      );
    } catch (error) {
      console.error('Kakao 콜백 상세 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent('카카오 로그인 처리 중 오류가 발생했습니다.')}`);
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

// prepare-signup 엔드포인트 추가
router.post('/prepare-signup', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    console.log('prepare-signup 요청:', { username });

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '사용자명이 필요합니다.'
      });
    }

    // 세션에 username 저장
    if (req.session) {
      req.session.pendingUsername = username;
      console.log('세션에 저장된 username:', req.session.pendingUsername);
    } else {
      throw new Error('세션이 없습니다.');
    }

    res.json({
      success: true,
      message: '사용자명이 성공적으로 저장되었습니다.'
    });
  } catch (error) {
    console.error('prepare-signup 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자명 저장 중 오류가 발생했습니다.'
    });
  }
});

export default router;