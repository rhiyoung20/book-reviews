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
    async (req: Request, accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('Google 로그인: 이메일 정보 없음');
          return done(null, false, { message: '이메일 정보를 가져올 수 없습니다.' });
        }

        const googleId = email.split('@')[0];
        // 세션에서 username 가져오기
        const username = req.session?.pendingUsername;

        // username이 있으면 회원가입 시도
        if (username) {
          console.log('회원가입 시도:', { username, googleId });
          
          try {
            const newUser = await User.create({
              username,
              googleId
            });
            console.log('새 사용자 생성 성공:', { username, googleId });
            return done(null, newUser);
          } catch (createError) {
            console.error('사용자 생성 실패:', createError);
            return done(null, false, { message: '회원가입 처리 중 오류가 발생했습니다.' });
          }
        }

        // username이 없으면 로그인 시도
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

// Kakao 회원가입 전략
passport.use('kakao-signup', new KakaoStrategy(
  {
    clientID: config.kakao.clientId,
    clientSecret: config.kakao.clientSecret,
    callbackURL: `${config.kakao.callbackUrl}/signup/callback`,
    state: true,
    passReqToCallback: true
  } as any,
  (async (req: Request, accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
    try {
      console.log('Kakao 프로필:', profile);
      const kakaoId = profile.id.toString();
      const username = req.session?.pendingUsername;

      // 이미 가입된 사용자인지 확인
      const existingUser = await User.findOne({
        where: { kakaoId }
      });

      if (existingUser) {
        return done(null, false, { message: '이미 가입된 카카오 계정입니다.' });
      }

      if (!username) {
        return done(null, false, { message: '사용자명이 필요합니다.' });
      }

      const newUser = await User.create({
        username,
        kakaoId
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }) as any
));

// Kakao 로그인 전략
passport.use('kakao',
  new KakaoStrategy(
    {
      clientID: config.kakao.clientId,
      clientSecret: config.kakao.clientSecret,
      callbackURL: config.kakao.callbackUrl,
      passReqToCallback: true
    } as any,
    (async (req: Request, accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
      try {
        const kakaoId = profile.id.toString();
        
        // kakaoId로 사용자 찾기
        const user = await User.findOne({
          where: { kakaoId }
        });

        if (!user) {
          return done(null, false, { message: '등록되지 않은 사용자입니다.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }) as any
  )
);

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