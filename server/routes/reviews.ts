import express from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { verifyToken } from '../middleware/auth';
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getReviews
} from '../controllers/reviewController';

const router = express.Router();

// 리뷰 목록 조회 (로그인 불필요)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getReviews(req, res);
  } catch (error) {
    next(error);
  }
});

// 리뷰 조회 (로그인 불필요)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getReview(req, res);
  } catch (error) {
    next(error);
  }
});

// 리뷰 작성 (로그인 필요)
router.post('/', 
  verifyToken as express.RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createReview(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 리뷰 수정 (로그인 필요)
router.put('/:id',
  verifyToken as express.RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateReview(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// 리뷰 삭제 (로그인 필요)
router.delete('/:id',
  verifyToken as express.RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteReview(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;