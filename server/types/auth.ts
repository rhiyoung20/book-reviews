import { Request } from 'express';
import { Session } from 'express-session';

// 세션 타입 확장
interface CustomSession extends Session {
  pendingUsername?: string;
}

// Request 타입 확장
export interface RequestWithUser extends Request {
  user?: AuthUser;
  session: CustomSession;
}

// 사용자 타입
export interface AuthUser {
  id: number;
  username: string;
  googleId?: string;
  kakaoId?: string;
  isAdmin?: boolean;
}

// CustomUser 인터페이스 수정
export interface CustomUser {
  id: number;
  username?: string;
  googleId?: string;
  kakaoId?: string;
}

// 기존 User 타입과 통합
export type User = AuthUser;