// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { RequestWithUser } from '../types/auth';
import { User } from '../models';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, async (err: any, user: User | undefined, info: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 내부 오류' });
    }
    
    if (!user) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    (req as RequestWithUser).user = user;

    next();
  })(req, res, next);
};