import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import config from '../config/config';
import { generateTempPassword, sendTempPasswordEmail } from '../utils/email';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService';
import prisma from '../lib/prisma';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // ... 로그인 로직
  } catch (error) {
    // ... 에러 처리
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    // ... 비밀번호 찾기 로직
  } catch (error) {
    // ... 에러 처리
  }
};

export const checkUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    console.log('Checking username:', username); // 디버깅용

    if (!username || username.trim().length < 2) {
      res.status(400).json({ 
        available: false, 
        message: '사용자명은 2자 이상이어야 합니다.' 
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    console.log('Existing user:', existingUser); // 디버깅용

    if (existingUser) {
      res.status(200).json({ 
        available: false, 
        message: '이미 사용 중인 사용자명입니다.' 
      });
      return;
    }

    res.status(200).json({ 
      available: true, 
      message: '사용 가능한 사용자명입니다.' 
    });
  } catch (error) {
    console.error('사용자명 확인 오류:', error);
    res.status(500).json({ 
      available: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

export const sendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const verificationToken = generateVerificationToken();
    
    // 데이터베이스에 인증 토큰 저장
    await prisma.emailVerification.create({
      data: {
        email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후 만료
      }
    });

    // 인증 이메일 발송
    await sendVerificationEmail(email);
    
    res.status(200).json({ message: '인증 이메일이 발송되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '이메일 발송 중 오류가 발생했습니다.' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const verification = await prisma.emailVerification.findFirst({
      where: {
        token,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verification) {
      return res.status(400).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
    }

    // 인증 상태 업데이트
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    res.status(200).json({ message: '이메일이 성공적으로 인증되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, phone } = req.body;
    
    console.log('회원가입 요청 데이터:', { 
      username, 
      email, 
      phone,
      hasPassword: !!password 
    });

    // 필수 필드 검증
    if (!username || !email || !password) {
      console.log('필수 필드 누락:', { 
        hasUsername: !!username, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      res.status(400).json({
        success: false,
        message: '모든 필수 항목을 입력해주세요.'
      });
      return;
    }

    // 이메일 인증 확인
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verified: true
      }
    });

    console.log('이메일 인증 상태:', { 
      email, 
      isVerified: !!emailVerification 
    });

    if (!emailVerification) {
      res.status(400).json({
        success: false,
        message: '이메일 인증이 필요합니다.'
      });
      return;
    }

    try {
      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('비밀번호 해시화 완료');

      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          phone: phone || null
        }
      });

      console.log('사용자 생성 성공:', { 
        id: user.id, 
        username: user.username 
      });

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.'
      });
    } catch (dbError: any) {
      console.error('데이터베이스 오류:', {
        code: dbError.code,
        message: dbError.message,
        meta: dbError.meta
      });
      
      if (dbError.code === 'P2002') {
        res.status(400).json({
          success: false,
          message: '이미 사용 중인 사용자명 또는 이메일입니다.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '데이터베이스 오류가 발생했습니다.'
        });
      }
    }
  } catch (error) {
    console.error('회원가입 처리 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
};