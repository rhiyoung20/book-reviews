import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';
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
const googleStrategyConfig: StrategyOptionsWithRequest = {
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackUrl,
  passReqToCallback: true as const
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

// Google Strategy 설정
passport.use(
  'google',
  new GoogleStrategy(
    googleStrategyConfig,
    async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        console.log('Google 인증 시작:', { 
          session: req.session,
          pendingUsername: req.session?.pendingUsername 
        });

        const pendingUsername = req.session?.pendingUsername;
        if (!pendingUsername) {
          return done(new Error('사용자명이 필요합니다.'));
        }

        // username으로 기존 사용자 찾기
        let user = await User.findOne({ 
          where: { username: pendingUsername }
        });
        
        if (!user) {
          // 새 사용자 생성
          user = await User.create({
            username: pendingUsername,
            googleId: profile.id
          });
          console.log('새 사용자 생성됨:', user.toJSON());
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Passport Google 전략 오류:', error);
        return done(error);
      }
    }
  )
);

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
        // 세션에서 사용자가 입력한 username 가져오기
        const username = req.session?.pendingUsername;
        let user = await User.findOne({ where: { kakaoId: profile.id } });
        
        if (!user) {
          if (!username) {
            return done(new Error('사용자명이 필요합니다.'));
          }
          
          // 사용자가 입력한 username으로 새 사용자 생성
          user = await User.create({
            username: username,  // 입력받은 username 사용
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