import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare phone: string;
  declare email_verified: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare isAdmin: boolean;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: false
});

export default User;