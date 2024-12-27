import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { User } from '../models';
import config from './config';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';

// 설정 로그
console.log('OAuth Config:', {
  google: {
    hasClientId: !!config.google.clientId,
    hasClientSecret: !!config.google.clientSecret,
    callbackUrl: config.google.callbackUrl
  },
  kakao: {
    hasClientId: !!config.kakao.clientId,
    hasClientSecret: !!config.kakao.clientSecret,
    callbackUrl: config.kakao.callbackUrl
  }
});

// Google Strategy 설정
const googleStrategyConfig = {
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackUrl
};

// Kakao Strategy 타입 정의
interface KakaoStrategyConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  passReqToCallback: boolean;
}

// Kakao Strategy 설정 객체
const kakaoStrategyConfig: KakaoStrategyConfig = {
  clientID: config.kakao.clientId,
  clientSecret: config.kakao.clientSecret,
  callbackURL: config.kakao.callbackUrl,
  passReqToCallback: true
};

// Kakao Strategy 설정
passport.use(new KakaoStrategy(
  {
    ...kakaoStrategyConfig,
    passReqToCallback: true
  } as KakaoStrategyConfig,
  ((
    req: Request, 
    accessToken: string, 
    refreshToken: string, 
    params: any,
    profile: any, 
    done: (error: any, user?: any, info?: any) => void
  ) => {
    return (async () => {
      try {
        const username = req.session?.pendingUsername;
        let user = await User.findOne({ where: { kakaoId: profile.id } });
        
        if (!user) {
          if (!username) {
            return done(new Error('사용자명이 필요합니다.'));
          }
          
          user = await User.create({
            username: username,
            kakaoId: profile.id
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    })();
  }) as any
));

// 세션 설정
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;