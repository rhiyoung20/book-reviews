import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import { Comment, User } from '../models';

// 리뷰의 댓글 목록 조회
export const getReviewComments = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const comments = await Comment.findAll({
      where: { reviewId },
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [
        ['createdAt', 'DESC'],
        ['parentId', 'ASC']  // 대댓글 순서
      ]
    });

    return res.json({ comments });
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    return res.status(500).json({ 
      message: '댓글 목록을 불러오는 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 작성
export const createComment = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!content?.trim()) {
      return res.status(400).json({ 
        message: '댓글 내용을 입력해주세요.' 
      });
    }

    const comment = await Comment.create({
      content,
      userId,
      username,
      reviewId,
      parentId: parentId || null
    });

    // 생성된 댓글 정보 반환 시 작성자 정보 포함
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

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
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);

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

    await comment.update({ content });

    return res.json({ 
      message: '댓글이 수정되었습니다.',
      comment 
    });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return res.status(500).json({ 
      message: '댓글 수정 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 삭제
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    const comment = await Comment.findByPk(id);

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

    await comment.destroy();

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