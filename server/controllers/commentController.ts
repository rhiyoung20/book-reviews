import express from 'express';
import type { Request, Response } from 'express-serve-static-core';
import { CommentModel } from '../models/Comment';
import { UserModel } from '../models/User';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  }
}

// 리뷰의 댓글 목록 조회
export const getReviewComments = async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const comments = await CommentModel.findByReviewId(reviewId);
    return res.json({ comments });
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    return res.status(500).json({ 
      message: '댓글 목록을 불러오는 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 작성
export const createComment = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const reviewId = parseInt(req.params.reviewId);
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ 
        message: '댓글 내용을 입력해주세요.' 
      });
    }

    const comment = await CommentModel.create({
      content,
      userId,
      reviewId,
      parentId: parentId || null
    });

    if (!comment.id) {
      throw new Error('댓글 생성 실패');
    }

    const commentWithUser = await CommentModel.findById(comment.id);

    return res.status(201).json({
      message: '댓글이 등록되었습니다.',
      comment: commentWithUser
    });
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return res.status(500).json({ 
      message: '댓글 등록 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 수정
export const updateComment = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const id = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ 
        message: '댓글을 찾을 수 없습니다.' 
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ 
        message: '댓글 수정 권한이 없습니다.' 
      });
    }

    await CommentModel.update(id, content);

    const updatedComment = await CommentModel.findById(id);

    return res.json({ 
      message: '댓글이 수정되었습니다.',
      comment: updatedComment
    });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return res.status(500).json({ 
      message: '댓글 수정 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 삭제
export const deleteComment = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ 
        message: '댓글을 찾을 수 없습니다.' 
      });
    }

    if (comment.userId !== userId && !isAdmin) {
      return res.status(403).json({ 
        message: '댓글 삭제 권한이 없습니다.' 
      });
    }

    await CommentModel.delete(id);

    return res.json({ 
      message: '댓글이 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return res.status(500).json({ 
      message: '댓글 삭제 중 오류가 발생했습니다.' 
    });
  }
};