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

// Google Strategy 등록
passport.use(
  new GoogleStrategy(
    googleStrategyConfig,
    async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        console.log('Google Profile:', { 
          id: profile.id,
          emails: profile.emails,
          displayName: profile.displayName
        });

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('Google 로그인: 이메일 정보 없음');
          return done(null, false, { message: '이메일 정보를 가져올 수 없습니다.' });
        }

        const googleId = email.split('@')[0];
        console.log('Google OAuth 정보:', { 
          email, 
          googleId,
          profileId: profile.id 
        });

        // 회원가입 시도인 경우
        if (req.path.includes('/signup')) {
          const username = req.query.username as string;
          if (!username) {
            return done(null, false, { message: '사용자명이 필요합니다.' });
          }

          // 새 사용자 생성 (이메일의 @ 앞부분을 googleId로 저장)
          const newUser = await User.create({
            username,
            googleId
          });

          return done(null, newUser);
        }

        // 로그인 시도인 경우 (이메일의 @ 앞부분으로 찾기)
        const user = await User.findOne({ where: { googleId } });
        if (!user) {
          return done(null, false, { message: '등록되지 않은 사용자입니다. 회원가입이 필요합니다.' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(null, false, { message: '처리 중 오류가 발생했습니다.' });
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