import nodemailer from 'nodemailer';
import crypto from 'crypto';
import prisma from '../lib/prisma';

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true // 디버깅 활성화
});

// 인증 토큰 생성
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 인증 이메일 발송
export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('Sending email to:', email); // 디버깅용
    console.log('SMTP Config:', { // 디버깅용
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });

    const verificationToken = generateVerificationToken();
    
    // 기존 토큰이 있다면 삭제
    await prisma.emailVerification.deleteMany({
      where: { email }
    });

    // 새 토큰 저장
    await prisma.emailVerification.create({
      data: {
        email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후 만료
      }
    });

    // 인증 URL 생성
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '책익는 마을 - 이메일 주소 확인',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">책익는 마을 이메일 인증</h2>
          <p style="color: #666; line-height: 1.6;">
            아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              이메일 인증하기
            </a>
          </div>
          <p style="color: #666; font-size: 0.9em;">
            이 링크는 24시간 동안 유효합니다.
          </p>
        </div>
      `
    };
    // 이메일 발송
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info); // 디버깅용
    return true;
  } catch (error) {
    console.error('Email sending error:', error); // 상세 에러 로깅
    throw error;
  }
}