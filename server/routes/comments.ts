import express from 'express';
import { RequestWithUser } from '../types/auth';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
  getUserComments
} from '../controllers/commentController';
import verifyToken from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 사용자별 댓글 목록 조회
router.get('/user/:username', verifyToken, getUserComments);

// 댓글 목록 조회
router.get('/', getComments);

// 댓글 작성
router.post('/', verifyToken, createComment);

// 댓글 수정
router.put('/:id', verifyToken, updateComment);

// 댓글 삭제
router.delete('/:id', verifyToken, deleteComment);

export default router;