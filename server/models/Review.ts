import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
  id: number;
  title: string;
  bookTitle: string;
  content: string;
  views: number;
  username: string;
  publisher?: string;
  bookAuthor?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewCreationAttributes extends Omit<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> {
  declare id: number;
  declare title: string;
  declare bookTitle: string;
  declare content: string;
  declare views: number;
  declare username: string;
  declare publisher?: string;
  declare bookAuthor?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// 모델 초기화를 바로 실행
Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bookTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    username: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    publisher: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bookAuthor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',  // 테이블 이름 명시
    timestamps: true,      // createdAt, updatedAt 자동 관리
  }
);

export default Review;