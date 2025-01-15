import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// User 모델
export class User extends Model {
  public id!: number;
  public username!: string;
  public googleId?: string;
  public kakaoId?: string;
  public isAdmin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    kakaoId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

// Review 모델
class ReviewModel extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public username!: string;
  public bookTitle!: string;
  public views?: number;
  public publisher?: string;
  public bookAuthor?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const Review = ReviewModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bookTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    modelName: 'Review',
  }
);

// Comment 모델
class CommentModel extends Model {
  public id!: number;
  public content!: string;
  public username!: string;
  public reviewId!: number;
  public parentId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const Comment = CommentModel.init(
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
      type: DataTypes.STRING(255),
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
    modelName: 'Comment',
  }
);

// 모델 간 관계 설정
User.hasMany(Review, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'reviews'
});

Review.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user'
});

User.hasMany(Comment, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'comments'
});

Comment.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user'
});

Review.hasMany(Comment, {
  foreignKey: 'reviewId',
  as: 'comments'
});

Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  as: 'review'
});