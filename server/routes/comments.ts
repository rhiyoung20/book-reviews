import express from 'express';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { verifyToken } from '../middleware/auth';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
  getUserComments
} from '../controllers/commentController';
import { CustomRequest } from '../middleware/auth';

const router = express.Router();

// 사용자별 댓글 목록 조회 (로그인 필요)
router.get('/user/:username', verifyToken, getUserComments);

// 리뷰별 댓글 목록 조회
router.get('/:reviewId', getComments);

// 댓글 작성
router.post('/:reviewId', verifyToken, createComment);

// 댓글 수정
router.put('/:id', verifyToken, updateComment);

// 댓글 삭제
router.delete('/:id', verifyToken, deleteComment);

export default router;