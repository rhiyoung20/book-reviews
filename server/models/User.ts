import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public phoneNumber!: string;
  public isAdmin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 비밀번호 해싱
  public async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // 비밀번호 검증
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[가-힣]+$/ // 한글만 허용
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

export default User;