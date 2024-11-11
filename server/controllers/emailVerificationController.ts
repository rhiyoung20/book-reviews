import { Request, Response } from 'express';
import { sendVerificationEmail } from '../services/emailService';
import prisma from '../lib/prisma';

// 이메일 인증 메일 발송
export const sendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      res.status(400).json({ 
        success: false, 
        message: '이메일 주소를 입력해주세요.' 
      });
      return;
    }

    await sendVerificationEmail(email.trim());
    
    res.status(200).json({ 
      success: true, 
      message: '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.' 
    });
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이메일 발송 중 오류가 발생했습니다.' 
    });
  }
};

// 이메일 인증 확인
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 인증 토큰입니다.' 
      });
      return;
    }

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
      res.status(400).json({ 
        success: false, 
        message: '만료되었거나 유효하지 않은 인증 토큰입니다.' 
      });
      return;
    }

    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    res.status(200).json({ 
      success: true, 
      message: '이메일이 성공적으로 인증되었습니다.',
      email: verification.email 
    });
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이메일 인증 처리 중 오류가 발생했습니다.' 
    });
  }
};