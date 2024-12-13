import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import prisma from '../lib/prisma';

// CustomUser 인터페이스 정의
interface CustomUser {
  id: number;
  username?: string;
  socialId?: string;
  socialType?: string;
  isAdmin: boolean;
}

// Request에 user 속성 추가
interface CustomRequest extends Request {
  user?: CustomUser;
}

// 관리자 로그인
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (username === config.admin.username && 
        password === config.admin.password) {
      const token = jwt.sign(
        { 
          id: 0,
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
};

// 소셜 로그인 성공 시 처리
export const socialLoginSuccess = async (req: CustomRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) {
      return res.redirect(`${config.client.url}/login?error=no_user`);
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username || '',
        isAdmin: user.isAdmin || false
      },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    let redirectUrl = `${config.client.url}/login/success?token=${token}`;  // /login/success -> /auth/success
    
    if (!user.username) {
      redirectUrl += '&needsUsername=true';
    } else {
      redirectUrl += `&username=${user.username}`;
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('소셜 로그인 오류:', error);
    res.redirect(`${config.client.url}/login?error=auth_failed`);
  }
};

// 사용자명 중복 체크
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
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