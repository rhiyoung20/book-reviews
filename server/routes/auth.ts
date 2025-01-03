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
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  })
);

// Google 콜백
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Google 콜백 도착:', { 
      query: req.query,
      code: req.query.code,
      username: req.query.username  // username 확인
    });
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      if (!user) {
        console.error('Google 콜백: 사용자 정보 없음');
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(
            '사용자 정보를 찾을 수 없습니다.'
          )}`
        );
      }

      const token = generateToken(user);
      console.log('Google OAuth 성공:', { 
        username: user.username,
        hasToken: !!token 
      });

      // 성공 시 메인 페이지로 리다이렉트
      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${encodeURIComponent(
          user.username
        )}&status=success`
      );
    } catch (error) {
      console.error('Google 콜백 처리 오류:', error);
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(
          'Google 로그인 처리 중 오류가 발생했습니다.'
        )}`
      );
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
    session: true
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

// prepare-signup 엔드포인트
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
      // 세션 저장이 완료될 때까지 기다림
      await new Promise((resolve) => req.session.save(resolve));
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

// Google 회원가입
router.get('/google/signup',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Google 회원가입 시도 - 세션:', { 
      sessionId: req.sessionID,
      username: req.session?.pendingUsername 
    });
    
    if (!req.session?.pendingUsername) {
      return res.redirect(`${process.env.FRONTEND_URL}/signup?error=username_required`);
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: true  // 세션 사용 명시
  })
);

// Kakao 회원가입
router.get('/kakao/signup',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Kakao 회원가입 시작:', {
      sessionId: req.sessionID,
      username: req.session?.pendingUsername
    });
    
    if (!req.session?.pendingUsername) {
      return res.redirect(`${process.env.FRONTEND_URL}/signup?error=username_required`);
    }
    next();
  },
  passport.authenticate('kakao-signup', {
    authType: 'reauthenticate',
    prompt: 'login',
    state: Math.random().toString(36).substring(7)
  } as any)
);

// Kakao 회원가입 콜백
router.get('/kakao/signup/callback',
  passport.authenticate('kakao', { 
    session: true,
    failureRedirect: `${process.env.FRONTEND_URL}/signup?error=auth_failed`
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const token = generateToken(user);
      res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}&username=${encodeURIComponent(user.username)}&status=success`
      );
    } catch (error) {
      console.error('Kakao 회원가입 콜백 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL}/signup?error=auth_failed`);
    }
  }
);

export default router;