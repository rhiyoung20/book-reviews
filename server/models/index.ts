import { Comment } from './Comment';
import { User } from './User';
import Review from './Review';
import { initReview } from './Review';  

// Review 모델 초기화
const ReviewModel = initReview();

export {
  Comment,
  User,
  ReviewModel as Review
};