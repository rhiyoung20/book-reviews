import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { PassportStatic } from 'passport';
import { Profile } from 'passport-google-oauth20';
import { VerifyCallback } from 'passport-oauth2';
import { Request } from 'express';
import config from './config';

const prisma = new PrismaClient();

export default function configurePassport(passport: PassportStatic) {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });

  // 환경변수 확인 및 로깅
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = `${process.env.BACKEND_URL}/api/auth/google/callback`;

  console.log('Google OAuth Config:', {
    clientID: clientID ? '설정됨' : '미설정',
    clientSecret: clientSecret ? '설정됨' : '미설정',
    callbackURL
  });

  if (!clientID || !clientSecret || !callbackURL) {
    console.warn('Google OAuth credentials not configured. Social login will be disabled.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true
  }, async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
      console.log('Google 콜백 시작:', {
        profileId: profile.id,
        sessionState: req.session?.state
      });
      
      // 세션에서 username 가져오기
      const username = req.session?.state;
      console.log('Session username:', username);

      if (!username) {
        console.error('Username not found in session');
        return done(new Error('사용자명이 필요합니다.'));
      }

      // 기존 사용자 확인
      let user = await prisma.user.findFirst({
        where: {
          socialId: profile.id,
          socialType: 'google'
        }
      });

      if (user) {
        console.log('기존 사용자 로그인:', user);
        return done(null, user);
      }

      // 새 사용자 생성
      try {
        console.log('새 사용자 생성 시도:', {
          username,
          socialId: profile.id,
          socialType: 'google'
        });

        user = await prisma.user.create({
          data: {
            username: username,
            socialId: profile.id,
            socialType: 'google',
            isAdmin: false
          }
        });

        console.log('새 사용자 생성 성공:', user);
        return done(null, user);
      } catch (createError) {
        console.error('사용자 생성 상세 오류:', createError);
        return done(new Error('사용자 생성에 실패했습니다.'));
      }

    } catch (error) {
      console.error('Google OAuth 상세 에러:', error);
      return done(error as Error);
    }
  }));
}