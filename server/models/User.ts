import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// 기본 속성 인터페이스
interface UserAttributes {
  id: number;
  username: string;
  googleId?: string;
  kakaoId?: string;
  isAdmin?: boolean;
}

// 생성 시 id는 선택적으로 만듦
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model {
  public id!: number;
  public username!: string;
  public googleId?: string;
  public kakaoId?: string;
  public isAdmin?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static isAdminUsername(username: string): boolean {
    const adminUsernames = ['관리자', '책마을이장', '책마을지기'];
    return adminUsernames.includes(username);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    googleId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    kakaoId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'users'
  }
);

export default User;