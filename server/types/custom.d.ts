import { Request } from 'express';

interface AuthUser {
  id: number;
  username: string;
  isAdmin?: boolean;
}

export interface CustomRequest extends Request {
  user?: AuthUser;
}