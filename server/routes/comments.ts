import express from 'express';
import type { Response, RequestHandler } from 'express';
import { RequestWithUser } from '../types/auth';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
  getUserComments
} from '../controllers/commentController';
import verifyToken from '../middleware/auth';

const router = express.Router();

// 타입 안전한 비동기 핸들러
const asyncHandler = (
  fn: (req: RequestWithUser, res: Response) => Promise<Response | void | undefined>
): RequestHandler => {
  return (req, res, next): void => {
    Promise.resolve(fn(req as RequestWithUser, res)).catch((error: unknown) => next(error));
  };
};

// 사용자별 댓글 목록 조회 (로그인 필요)
router.get('/user/:username', 
  verifyToken as RequestHandler,
  asyncHandler(getUserComments)
);

// 리뷰별 댓글 목록 조회
router.get('/:reviewId', asyncHandler(getComments));

// 댓글 작성
router.post('/:reviewId', 
  verifyToken as RequestHandler,
  asyncHandler(createComment)
);

// 댓글 수정
router.put('/:id', 
  verifyToken as RequestHandler,
  asyncHandler(updateComment)
);

// 댓글 삭제
router.delete('/:id', 
  verifyToken as RequestHandler,
  asyncHandler(deleteComment)
);

export default router;