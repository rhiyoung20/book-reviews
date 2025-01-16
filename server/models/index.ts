import { DataTypes, Model, Sequelize } from 'sequelize';
import config from '../config/config';

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect
  }
);

class User extends Model {
  public id!: number;
  public username!: string;
  public googleId?: string;
  public kakaoId?: string;
  public isAdmin?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

class Review extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public bookTitle!: string;
  public bookAuthor!: string;
  public publisher?: string;
  public username!: string;
  public views!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

class Comment extends Model {
  public id!: number;
  public content!: string;
  public username!: string;
  public reviewId!: number;
  public parentId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    googleId: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    kakaoId: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  }
);

Review.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bookTitle: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    bookAuthor: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    publisher: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    username: {
      type: new DataTypes.STRING(45),
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,    
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username: {
      type: new DataTypes.STRING(45),
      allowNull: false,
    },
    reviewId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

User.hasMany(Review, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'reviews',
});

Review.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user',
});

Review.hasMany(Comment, {
  foreignKey: 'reviewId',
  sourceKey: 'id',
  as: 'comments',
  onDelete: 'SET NULL',
});

Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  targetKey: 'id',
  as: 'review',
});

Comment.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
  as: 'user',
});

User.hasMany(Comment, {
  foreignKey: 'username',
  sourceKey: 'username',
  as: 'comments',
});

Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  sourceKey: 'id',
  as: 'replies',
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  targetKey: 'id',
  as: 'parent',
});

export { User, Review, Comment };
export default sequelize;