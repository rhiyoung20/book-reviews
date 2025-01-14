import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// User 모델
class User extends Model {
  public id!: number;
  public username!: string;
  public googleId?: string;
  public kakaoId?: string;
  public isAdmin?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static isAdminUsername(username: string): boolean {
    const adminUsernames = ['책마을이장'];
    return adminUsernames.includes(username);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    googleId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    kakaoId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'users'
  }
);

// Review 모델
class Review extends Model {
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bookTitle: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
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

// Comment 모델
class Comment extends Model {
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
    tableName: 'comments',
  }
);

// 관계 설정
Review.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user'
});

Comment.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user'
});

Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  as: 'review'
});

Review.hasMany(Comment, {
  foreignKey: 'reviewId',
  as: 'comments'
});

export { User, Review, Comment, sequelize };