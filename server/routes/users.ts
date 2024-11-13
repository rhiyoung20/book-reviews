import express from 'express';
import type { Response, NextFunction } from 'express-serve-static-core';
import { changePassword, getUserReviews, getUserComments } from '../controllers/userController';
import { verifyToken, RequestWithUser, UserPayload } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(verifyToken as express.RequestHandler);

type CustomRequestHandler = express.RequestHandler<
  {},
  any,
  any,
  any,
  { user: UserPayload }
>;

// 라우트 핸들러를 미들웨어로 감싸서 처리
const asyncHandler = (fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>): CustomRequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUser, res, next)).catch(next);
  };

// 비밀번호 변경 라우트 수정
router.put('/password', asyncHandler(async (req, res) => {
  await changePassword(req, res);
}));

// 사용자의 리뷰 목록 조회
router.get('/reviews', asyncHandler(async (req, res) => {
  await getUserReviews(req, res);
}));

// 사용자의 댓글 목록 조회
router.get('/comments', asyncHandler(async (req, res) => {
  await getUserComments(req, res);
}));

export default router;