import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number | string;
  nodeEnv: string;
  database: {
    name: string;
    username: string;
    password: string;
    host: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string | undefined;
    port: number;
    user: string | undefined;
    pass: string | undefined;
  };
  aws: {
    region: string | undefined;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  database: {
    name: process.env.DB_DATABASE || 'book_review',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'Highting9103!',
    host: process.env.DB_HOST || 'localhost'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

export default config;