import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  jwt: {
    secret: string;
  };
  database: {
    host: string;
    user: string;
    password: string;
    name: string;
  };
  jwtSecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 4000,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'book_review'
  },
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key'
};

export default config;