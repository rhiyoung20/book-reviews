import { config as dotenvConfig } from "dotenv";
dotenvConfig();

interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

interface EnvironmentConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: string;
}

interface Config {
  port: number;
  db: DbConfig;
  test: EnvironmentConfig;
  production: EnvironmentConfig;
  development: EnvironmentConfig;
  sessionSecret: string;
  google: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
  kakao: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
}

const env = process.env.NODE_ENV || 'development';

const config = {
  username: 'root',
  password: 'Highting9103!',
  database: 'book_reviews',
  host: '127.0.0.1',
  dialect: 'mysql' as const,
  sessionSecret: 'c280a08016cdb5edb2042c377b732393a43c71e1192ef468a108df3580ad81919648fa9a90356cb40c45bd40ffa1e7445ee2a83f6e3e9158ca6166972461f74d',
  jwtSecret: 'your-jwt-secret',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID || 'your-kakao-client-id',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || 'your-kakao-client-secret',
    callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:3000/auth/kakao/callback'
  }
};

export default config;