import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../models';
import { RequestWithUser } from '../types/auth';

// User 타입 정의 수정
interface CustomUser extends User {
  id: number;
  username: string;
  googleId?: string;
  kakaoId?: string;
}

// socialLoginSuccess 함수 수정
export const socialLoginSuccess = async (req: RequestWithUser, res: Response) => {
  try {
    const { user } = req;
    if (!user) {
      return res.redirect(`${config.frontendUrl}/login?error=no_user`);
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.redirect(`${config.frontendUrl}/?token=${token}&username=${user.username}&status=success`);
  } catch (error) {
    console.error('소셜 로그인 오류:', error);
    res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
  }
};

// 사용자명 중복 체크
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    const user = await User.findOne({ where: { username } });
    
    res.json({
      success: true,
      available: !user,
      message: !user ? '사용 가능한 사용자명입니다.' : '이미 사용 중인 사용자명입니다.'
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
    const user = (req as any).user;
    
    res.json({
      success: true,
      username: user.username,
      isAdmin: User.isAdminUsername(user.username || '')
    });
  } catch (error) {
    console.error('인증 확인 오류:', error);
    res.status(401).json({
      success: false,
      message: '인증에 실패했습니다.'
    });
  }
};

export const checkAuth = (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
  }
  res.json({ user: req.user });
};