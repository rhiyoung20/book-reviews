import express from 'express';
import authRouter from './auth';
import reviewRouter from './reviews';
import commentRouter from './comments';

const router = express.Router();

// 디버깅을 위한 미들웨어 추가
router.use((req, res, next) => {
  console.log('요청 경로:', req.method, req.path);
  next();
});

router.use('/auth', authRouter);
router.use('/reviews', reviewRouter);

// 댓글 라우트를 reviews 하위에 직접 등록
reviewRouter.use('/:reviewId', commentRouter);

export default router; 