import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface CommentAttributes {
  id: number;
  content: string;
  username: string;
  reviewId: number;
  parentId?: number;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public username!: string;
  public reviewId!: number;
  public parentId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'comments',
  }
);

export default Comment;