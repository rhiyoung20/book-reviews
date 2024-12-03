import User from './User';
import Review from './Review';
import Comment from './Comment';

// 관계 설정
Review.hasMany(Comment, {
  foreignKey: 'reviewId',
  as: 'comments'
});

Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  as: 'review'
});

export {
  User,
  Review,
  Comment
};