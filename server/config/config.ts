import dotenv from 'dotenv';

// .env 파일 로드 (한 번만)
if (!process.env.CONFIG_LOADED) {
  dotenv.config();
  process.env.CONFIG_LOADED = 'true';
}

// 필수 환경 변수 체크
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
  'JWT_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`환경 변수 ${varName}가 설정되지 않았습니다.`);
  }
});

// 기본값이 있는 환경 변수
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: `${BACKEND_URL}/api/auth/google/callback`
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID!,
    clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    callbackUrl: `${BACKEND_URL}/api/auth/kakao/callback`
  },
  jwtSecret: process.env.JWT_SECRET!,
  sessionSecret: process.env.SESSION_SECRET!,
  frontendUrl: process.env.FRONTEND_URL!,
  backendUrl: BACKEND_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10)
};

// 설정값 로깅 (한 번만)
if (!process.env.CONFIG_LOGGED) {
  console.log('Environment variables loaded from:', process.env.DOTENV_PATH || '.env');
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
  process.env.CONFIG_LOGGED = 'true';
}

export default config;