import express from 'express';
import { Request } from 'express';
import type { Response, NextFunction } from 'express-serve-static-core';
import jwt from 'jsonwebtoken'
import config from '../config/config'

export interface UserPayload {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface CustomRequest extends Request {
  user?: UserPayload;
}

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ptgoras916=25') as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
} 