import User from './User';
import Review from './Review';
import Comment from './Comment';

// 관계 설정
Review.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });

Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

Comment.belongsTo(Review, { foreignKey: 'reviewId' });
Review.hasMany(Comment, { foreignKey: 'reviewId' });

// 대댓글 관계 설정
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

export { User, Review, Comment };