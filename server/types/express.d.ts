import 'express';
import 'express-session';

declare module 'express-session' {
  interface Session {
    state?: string;
  }
}

declare module 'express' {
  interface User {
    id?: number;
    username: string;
    socialId?: string;
    socialType?: string;
    isAdmin: boolean;
  }

  interface Request {
    session: Session & {
      state?: string;
    };
  }
}

export {};