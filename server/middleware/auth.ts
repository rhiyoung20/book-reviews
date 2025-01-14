import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { RequestWithUser } from '../types/auth';

const verifyToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('Authorization 헤더가 없습니다.');
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1]; // Bearer token 형식에서 토큰 추출
  
  if (!token) {
    console.log('토큰이 없습니다.');
    return res.status(401).json({ message: '유효한 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded as { id: number; username: string };
    console.log('인증된 사용자:', req.user);
    next();
  } catch (error) {
    console.log('토큰 검증 실패:', error);
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default verifyToken;