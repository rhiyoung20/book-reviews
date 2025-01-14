import express from 'express';
import type { Response, NextFunction } from 'express-serve-static-core';
import { getUserReviews, getUserComments } from '../controllers/userController';
import verifyToken from '../middleware/auth';
import type { RequestWithUser } from '../types/auth';
import { User } from '../models';

const router = express.Router();

// 타입 안전한 비동기 핸들러 수정
const asyncHandler = (
  fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<any>
): express.RequestHandler => {
  return (req, res, next): void => {
    Promise.resolve(fn(req as RequestWithUser, res, next)).catch(next);
  };
};

// 사용자의 리뷰 목록 조회
router.get('/reviews', 
  verifyToken as express.RequestHandler,
  asyncHandler(getUserReviews)
);

// 사용자의 댓글 목록 조회
router.get('/comments', 
  verifyToken as express.RequestHandler,
  asyncHandler(getUserComments)
);

// 회원가입 테스트 라우트
router.post('/test-signup', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '사용자명이 필요합니다.'
      });
    }

    const user = await User.create({
      username,
      isAdmin: false
    });

    console.log('테스트 회원가입 성공:', {
      id: user.id,
      username: user.username
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error: any) {
    console.error('테스트 회원가입 실패:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

export default router;