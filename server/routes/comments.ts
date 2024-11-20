import express from 'express';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { verifyToken } from '../middleware/auth';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment
} from '../controllers/commentController';
import { CustomRequest } from '../middleware/auth';

const router = express.Router();

// 리뷰의 댓글 목록 조회 (로그인 불필요)
router.get('/:reviewId/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getComments(req as CustomRequest, res);
  } catch (error) {
    next(error);
  }
});

// 댓글 작성 (로그인 필요)
router.post(
  '/:reviewId/comments', 
  verifyToken as express.RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createComment(req as CustomRequest, res);
    } catch (error) {
      next(error);
    }
  }
);

// 댓글 수정 (로그인 필요)
router.put(
  '/:reviewId/comments/:id', 
  verifyToken as express.RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateComment(req as CustomRequest, res);
    } catch (error) {
      next(error);
    }
  }
);

// 댓글 삭제 (로그인 필요)
router.delete(
  '/:reviewId/comments/:id', 
  verifyToken as express.RequestHandler, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteComment(req as CustomRequest, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;