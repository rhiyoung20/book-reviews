import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const googleCallbackUrl = (process.env.GOOGLE_CALLBACK_URL || '').replace('${BACKEND_URL}', backendUrl);
const kakaoCallbackUrl = (process.env.KAKAO_CALLBACK_URL || '').replace('${BACKEND_URL}', backendUrl);

console.log('Environment variables loaded from:', envPath);
console.log('OAuth credentials:', {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '설정되지 않음',
    callbackUrl: googleCallbackUrl
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID ? '설정됨' : '설정되지 않음',
    clientSecret: process.env.KAKAO_CLIENT_SECRET ? '설정됨' : '설정되지 않음',
    callbackUrl: kakaoCallbackUrl
  }
});

interface Env {
  google: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    callbackUrl: string | undefined;
  };
  kakao: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    callbackUrl: string | undefined;
  };
  client: {
    url: string | undefined;
  };
  database: {
    name: string | undefined;
    user: string | undefined;
    password: string | undefined;
    host: string | undefined;
    port: string | undefined;
  };
  backend: {
    port: string | undefined;
  };
  jwtSecret: string | undefined;
  sessionSecret: string | undefined;
}

export const env: Env = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackUrl: process.env.KAKAO_CALLBACK_URL
  },
  client: {
    url: process.env.CLIENT_URL
  },
  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  backend: {
    port: process.env.PORT
  },
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET
};