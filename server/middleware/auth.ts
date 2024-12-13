import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest, AuthUser } from '../types/auth';

const verifyToken = (
  req: CustomRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: '인증 토큰이 필요합니다.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default verifyToken;