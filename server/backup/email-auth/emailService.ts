import nodemailer from 'nodemailer';
import crypto from 'crypto';
import prisma from '../lib/prisma';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendVerificationEmail = async (email: string) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후

    // 기존 인증 정보 삭제
    await prisma.emailVerification.deleteMany({
      where: { email }
    });

    // 새 인증 정보 생성 (외래 키 제약 조건 없이)
    await prisma.emailVerification.create({
      data: {
        email,
        token: verificationToken,
        verified: false,
        expiresAt
      }
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/signup?token=${verificationToken}&email=${email}&verified=true`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '책익는 마을 - 이메일 인증',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">이메일 인증</h2>
          <p style="color: #666;">안녕하세요,</p>
          <p style="color: #666;">아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               target="_self"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px;">
              이메일 인증하기
            </a>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">
            이 링크는 24시간 동안 유효합니다.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};