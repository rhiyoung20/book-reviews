import express from 'express';
import type { Response, NextFunction } from 'express-serve-static-core';
import { changePassword, getUserReviews, getUserComments } from '../controllers/userController';
import { verifyToken, CustomRequest } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(verifyToken);

// 타입 안전한 비동기 핸들러
const asyncHandler = (
  fn: (req: CustomRequest, res: Response, next: NextFunction) => Promise<void>
) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// 비밀번호 변경
router.put('/password', asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  await changePassword(req, res);
}));

// 사용자의 리뷰 목록 조회
router.get('/reviews', asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  await getUserReviews(req, res, next);
}));

// 사용자의 댓글 목록 조회
router.get('/comments', asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  await getUserComments(req, res);    
}));

export default router;