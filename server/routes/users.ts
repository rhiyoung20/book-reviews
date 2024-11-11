import express from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { changePassword, getUserReviews, getUserComments } from '../controllers/userController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(verifyToken as express.RequestHandler);

// 비밀번호 변경
router.put('/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await changePassword(req, res);
  } catch (error) {
    next(error);
  }
});

// 사용자의 리뷰 목록 조회
router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserReviews(req, res);
  } catch (error) {
    next(error);
  }
});

// 사용자의 댓글 목록 조회
router.get('/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserComments(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;