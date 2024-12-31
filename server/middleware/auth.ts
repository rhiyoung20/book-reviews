import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser, AppUser } from '../types/auth';

const verifyToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '인증 토큰이 필요합니다.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Express.User;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: '유효하지 않은 토큰입니다.' 
    });
  }
};

export default verifyToken;