import nodemailer from 'nodemailer';

// 임시 비밀번호 생성 함수
export const generateTempPassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

// 이메일 발송 함수
export const sendTempPasswordEmail = async (email: string, tempPassword: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"책익는 마을" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '[책익는 마을] 임시 비밀번호가 발급되었습니다',
    html: `
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
        <h1 style="color: #2c5282;">임시 비밀번호 안내</h1>
        <p>안녕하세요, 책익는 마을입니다.</p>
        <p>요청하신 임시 비밀번호가 발급되었습니다:</p>
        <p style="background-color: #fff; padding: 10px; border-radius: 3px; font-size: 18px; font-weight: bold;">
          ${tempPassword}
        </p>
        <p style="color: #e53e3e;">보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.</p>
        <hr style="border: none; border-top: 1px solid #cbd5e0; margin: 20px 0;">
        <p style="color: #718096; font-size: 12px;">
          본 메일은 발신 전용입니다. 문의사항이 있으시면 책익는 마을 고객센터로 연락해주세요.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('임시 비밀번호 이메일 발송 완료:', email);
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw new Error('이메일 발송에 실패했습니다.');
  }
};

// 인증 코드 생성 함수
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 인증 코드 발송 함수
export const sendVerificationEmail = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"책익는 마을" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '[책익는 마을] 이메일 인증 코드입니다',
    html: `
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
        <h1 style="color: #2c5282;">이메일 인증 코드</h1>
        <p>안녕하세요, 책익는 마을입니다.</p>
        <p>회원가입을 위한 인증 코드입니다:</p>
        <p style="background-color: #fff; padding: 10px; border-radius: 3px; font-size: 24px; font-weight: bold; text-align: center;">
          ${code}
        </p>
        <p style="color: #718096;">인증 코드는 10분간 유효합니다.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};