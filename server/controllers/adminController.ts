import { RequestWithUser } from '../types/auth';
import { Response, NextFunction } from 'express';

export const adminOnly = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: '관리자만 접근할 수 있습니다.' });
  }
  next();
};