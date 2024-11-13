import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getReviews
} from '../controllers/reviewController';

const router = express.Router();

// 커스텀 Request 인터페이스 정의
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

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
  verifyToken as RequestHandler,
  (req, res, next) => {
    createReview(req as AuthRequest, res).catch(next);
  }
);

// 리뷰 수정 (로그인 필요)
router.put('/:id',
  verifyToken as RequestHandler,
  (req, res, next) => {
    updateReview(req as AuthRequest, res).catch(next);
  }
);

// 리뷰 삭제 (로그인 필요)
router.delete('/:id',
  verifyToken as RequestHandler,
  (req, res, next) => {
    deleteReview(req as AuthRequest, res).catch(next);
  }
);

// 관리자용 라우트
router.get('/admin/all',
  verifyToken as RequestHandler,
  (req, res, next) => {
    getReviews(req as AuthRequest, res).catch(next);
  }
);

router.delete('/admin/:id',
  verifyToken as RequestHandler,
  (req, res, next) => {
    deleteReview(req as AuthRequest, res).catch(next);
  }
);

export default router;