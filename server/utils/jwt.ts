import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: User) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      socialType: user.socialType 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};