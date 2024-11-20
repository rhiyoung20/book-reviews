import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import jwt from 'jsonwebtoken'
import config from '../config/config'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
      };
    }
  }
}

export interface UserPayload {
  id: number;
  username: string;
  isAdmin?: boolean;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' })
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'ptgoras916=25';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 토큰의 만료 시간 확인
    const tokenExp = (decoded as any).exp * 1000
    if (Date.now() >= tokenExp) {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      })
    }

    req.user = decoded as UserPayload;
    next()
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      })
    }
    
    return res.status(401).json({ 
      message: '유효하지 않은 토큰입니다.',
      code: 'INVALID_TOKEN'
    })
  }
} 

export interface CustomRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin?: boolean;
  };
} 