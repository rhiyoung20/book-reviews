declare module 'passport-kakao' {
    import OAuth2Strategy from 'passport-oauth2';
    import { Request } from 'express';
  
    export interface Profile {
      id: string;
      provider: string;
      username: string;
      displayName: string;
      _raw: string;
      _json: {
        id: number;
        properties: {
          nickname: string;
        };
      };
    }
  
    export interface StrategyOptions {
      clientID: string;
      clientSecret?: string;
      callbackURL: string;
      passReqToCallback?: boolean;
      authorizationURL?: string;
      tokenURL?: string;
      scopeSeparator?: string;
      customHeaders?: { [key: string]: string };
      userAgent?: string;
    }
  
    export type VerifyFunction = (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => void;
  
    export class Strategy extends OAuth2Strategy {
      constructor(options: StrategyOptions, verify: VerifyFunction);
      name: string;
      authenticate(req: Request, options?: any): void;
      userProfile(accessToken: string, done: (error: Error | null, profile?: Profile) => void): void;
    }
}