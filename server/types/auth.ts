import { Request } from 'express';

// Express의 User 타입 확장
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isAdmin?: boolean;
    }
  }
}

// 우리 앱의 User 타입 정의
export interface AppUser {
  id: number;
  username: string;
  isAdmin?: boolean;
}

// RequestWithUser 인터페이스
export interface RequestWithUser extends Request {
  user?: Express.User;
}