import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import config from './config';

// Google OAuth 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google?.clientId || '',
      clientSecret: config.google?.clientSecret || '',
      callbackURL: config.google?.callbackURL || ''
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 사용자 정보 처리 로직
        return done(null, profile);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Kakao OAuth 설정
passport.use(
  new KakaoStrategy(
    {
      clientID: config.kakao?.clientId || '',
      clientSecret: config.kakao?.clientSecret || '',
      callbackURL: config.kakao?.callbackURL || ''
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 사용자 정보 처리 로직
        return done(null, profile);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;