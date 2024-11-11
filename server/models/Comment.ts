import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Review } from '../models';

class Comment extends Model {
  public id!: number;
  public content!: string;
  public userId!: number;
  public reviewId!: number;
  public parentId?: number;  // 대댓글을 위한 필드
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reviews',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments'
});

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Review, { foreignKey: 'reviewId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Review.hasMany(Comment, { foreignKey: 'reviewId' });

export default Comment;