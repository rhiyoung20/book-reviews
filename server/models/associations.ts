import User from './User';
import Review from './Review';
import Comment from './Comment';

// Define associations
User.hasMany(Review, {
  foreignKey: 'username',
  sourceKey: 'username',
});

Review.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
});

Review.hasMany(Comment, {
  foreignKey: 'reviewId',
  sourceKey: 'id',
});

Comment.belongsTo(Review, {
  foreignKey: 'reviewId',
  targetKey: 'id',
});

Comment.belongsTo(User, {
  foreignKey: 'username',
  targetKey: 'username',
}); 