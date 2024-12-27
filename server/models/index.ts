import User from './User';
import Review from './Review';
import Comment from './Comment';
import sequelize from '../config/database';

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