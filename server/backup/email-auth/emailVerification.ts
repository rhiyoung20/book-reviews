import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class EmailVerification extends Model {
  declare id: number;
  declare email: string;
  declare token: string;
  declare verified: boolean;
  declare expiresAt: Date;
  declare createdAt: Date;
}

EmailVerification.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'EmailVerification',
  tableName: 'email_verifications',
  timestamps: true,
  updatedAt: false
});

export default EmailVerification;