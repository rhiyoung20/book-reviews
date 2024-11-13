import { Sequelize } from 'sequelize';
import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  // 사용자 생성
  static async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const result = await pool.models.User.create({
      username: user.username,
      email: user.email,
      password: hashedPassword,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin
    });
    return { ...user, password: hashedPassword } as User;
  }

  // 비밀번호 검증
  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // 이메일로 사용자 찾기
  static async findByEmail(email: string): Promise<User | null> {
    const user = await pool.models.User.findOne({
      where: { email }
    });
    return user?.toJSON() || null;
  }

  // 관리자 권한 변경 메서드 추가
  static async updateAdminStatus(userId: number, isAdmin: boolean): Promise<boolean> {
    try {
      await pool.models.User.update(
        { isAdmin },
        { where: { id: userId } }
      );
      return true;
    } catch (error) {
      console.error('Error updating admin status:', error);
      return false;
    }
  }

  // 관리자 확인 메서드 추가
  static async isAdmin(userId: number): Promise<boolean> {
    const user = await pool.models.User.findByPk(userId);
    return user?.getDataValue('isAdmin') || false;
  }
}

// MySQL 테이블 생성 쿼리 (참고용)
/*
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  isAdmin BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

export default UserModel;