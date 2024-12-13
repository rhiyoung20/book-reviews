import express from 'express';
import type { Response, NextFunction, RequestHandler } from 'express';
import { CustomRequest } from '../types/auth';
import { 
  getReview, 
  createReview, 
  getReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import verifyToken from '../middleware/auth';

const router = express.Router();

// 타입 안전한 비동기 핸들러
const asyncHandler = (
  fn: (req: CustomRequest, res: Response) => Promise<Response | void | undefined>
): RequestHandler => {
  return (req, res, next): void => {
    Promise.resolve(fn(req as CustomRequest, res)).catch((error: unknown) => next(error));
  };
};

// 리뷰 목록 조회 (로그인 불필요)
router.get('/', asyncHandler(getReviews));

// 특정 리뷰 조회 (로그인 불필요)
router.get('/:id', asyncHandler(getReview));

// 리뷰 작성 (로그인 필요)
router.post('/', 
  verifyToken as RequestHandler,
  asyncHandler(createReview)
);

// 리뷰 수정 (로그인 필요)
router.put('/:id',
  verifyToken as RequestHandler,
  asyncHandler(updateReview)
);

// 리뷰 삭제 (로그인 필요)
router.delete('/:id',
  verifyToken as RequestHandler,
  asyncHandler(deleteReview)
);

export default router;