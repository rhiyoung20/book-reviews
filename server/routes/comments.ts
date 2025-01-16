import express from 'express';
import type { RequestHandler } from 'express';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
  getUserComments
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 사용자별 댓글 목록 조회
router.get('/user/:username', authenticate as RequestHandler, getUserComments as RequestHandler);

// 댓글 목록 조회
router.get('/', getComments as RequestHandler);

// 댓글 작성
router.post('/', authenticate as RequestHandler, createComment as RequestHandler);

// 댓글 수정
router.put('/:id', authenticate as RequestHandler, updateComment as RequestHandler);

// 댓글 삭제
router.delete('/:id', authenticate as RequestHandler, deleteComment as RequestHandler);

export default router;