import express from 'express';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { verifyToken } from '../middleware/auth';
import {
  getReviewComments,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import { User } from '../models/User';

// RequestWithUser 타입을 여기서 직접 정의
interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

const router = Router();

// 리뷰의 댓글 목록 조회 (로그인 불필요)
router.get('/review/:reviewId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getReviewComments(req, res);
  } catch (error) {
    next(error);
  }
});

// 댓글 작성 (로그인 필요)
router.post(
  '/review/:reviewId', 
  verifyToken as express.RequestHandler,
  (async (req, res: Response, next: NextFunction) => {
    try {
      await createComment(req as RequestWithUser, res);
    } catch (error) {
      next(error);
    }
  }) as express.RequestHandler
);

// 댓글 수정 (로그인 필요)
router.put(
  '/:id', 
  verifyToken as express.RequestHandler,
  (async (req, res: Response, next: NextFunction) => {
    try {
      await updateComment(req as RequestWithUser, res);
    } catch (error) {
      next(error);
    }
  }) as express.RequestHandler
);

// 댓글 삭제 (로그인 필요)
router.delete(
  '/:id', 
  verifyToken as express.RequestHandler,
  (async (req, res: Response, next: NextFunction) => {
    try {
      await deleteComment(req as RequestWithUser, res);
    } catch (error) {
      next(error);
    }
  }) as express.RequestHandler
);

export default router;