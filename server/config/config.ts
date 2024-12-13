import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Config Loading - Frontend URL:', process.env.FRONTEND_URL);
console.log('Config Loading - Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Config Loading - Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  },
  client: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  }
};

export default config;