import { Request } from 'express';
import { Query } from 'express-serve-static-core';

interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}

export interface AuthUser {
    id: number;
    username: string;
    isAdmin: boolean;
  }
  
  export interface CustomRequest extends TypedRequestQuery<{
    page?: string;
    limit?: string;
    type?: string;
    term?: string;
  }> {
    user?: AuthUser;
  }