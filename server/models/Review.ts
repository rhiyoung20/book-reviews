import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
  id: number;
  title: string;
  bookTitle: string;
  content: string;
  views: number;
  username: string;
  publisher: string | null;
  bookAuthor: string | null;
}

class Review extends Model<ReviewAttributes> implements ReviewAttributes {
  public id!: number;
  public title!: string;
  public bookTitle!: string;
  public content!: string;
  public views!: number;
  public username!: string;
  public publisher!: string | null;
  public bookAuthor!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    bookTitle: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    username: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    publisher: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bookAuthor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
  }
);

export default Review;