import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Review from './Review';

interface CommentAttributes {
  id: number;
  content: string;
  username: string;
  reviewId: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentCreationAttributes extends Omit<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public username!: string;
  public reviewId!: number;
  public parentId!: number | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public Review?: Review; // Review 모델과의 관계를 위한 타입 선언
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
      type: DataTypes.STRING,
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
  }
);

// Review 모델과의 관계 설정
Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  as: 'review'
});

export default Comment;