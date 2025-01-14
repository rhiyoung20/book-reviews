import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { User } from '../models';
import config from '../config/config';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';

// Google Strategy 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.backendUrl}/api/auth/google/callback`,
      passReqToCallback: true
    },
    async (_req: Request, _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: '이메일 정보를 가져올 수 없습니다.' });
        }

        const googleId = email.split('@')[0];
        const user = await User.findOne({ where: { googleId } });

        if (!user) {
          return done(null, false, { message: '등록되지 않은 사용자입니다. 회원가입이 필요합니다.' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error as Error);
      }
    }
  )
);

// Kakao Strategy 설정
passport.use(
  'kakao',
  new KakaoStrategy(
    {
      clientID: config.kakao.clientId,
      clientSecret: config.kakao.clientSecret,
      callbackURL: config.kakao.callbackUrl
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) => {
      try {
        const kakaoId = profile.id?.toString();
        if (!kakaoId) {
          return done(new Error('카카오 ID를 찾을 수 없습니다.'));
        }

        const user = await User.findOne({ where: { kakaoId } });
        
        if (!user) {
          return done(null, false, { message: '등록되지 않은 사용자입니다. 회원가입이 필요합니다.' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Kakao Strategy Error:', error);
        return done(error);
      }
    }
  )
);

// 세션 직렬화
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 세션 역직렬화
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;