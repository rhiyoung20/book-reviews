import express from 'express';
import reviewRoutes from './reviews';
import authRoutes from './auth';
import commentRoutes from './comments';

const router = express.Router();

// 각 라우트 등록
router.use('/reviews', reviewRoutes);
router.use('/auth', authRoutes);     // auth 라우트 추가
router.use('/comments', commentRoutes);

// 라우트 등록 확인을 위한 로그
console.log('Registered routes:', 
  router.stack
    .map(r => r.route ? r.route.path : r.name)
    .filter(Boolean)
);

export default router; 