import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface ReviewAttributes {
  id: number;
  title: string;
  bookTitle: string;
  publisher: string;
  bookAuthor: string;
  content: string;
  userId: number;
  username: string;
  views: number;
}

class Review extends Model<ReviewAttributes, ReviewAttributes> implements ReviewAttributes {
  public id!: number;
  public title!: string;
  public bookTitle!: string;
  public publisher!: string;
  public bookAuthor!: string;
  public content!: string;
  public userId!: number;
  public username!: string;
  public views!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bookTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bookAuthor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'reviews',
  timestamps: true
});

export default Review;