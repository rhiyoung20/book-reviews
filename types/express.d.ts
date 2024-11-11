import { JwtPayload } from 'jsonwebtoken'
import { Request } from 'express-serve-static-core'

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: number;
      username: string;
      isAdmin?: boolean;
    }
  }
}

export {}