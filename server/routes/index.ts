import express from 'express';
import authRouter from './auth';
import reviewRouter from './reviews';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/reviews', reviewRouter);

export default router; 