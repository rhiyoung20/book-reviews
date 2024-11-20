import { Request, Response } from 'express';
import Comment, { CommentCreationAttributes } from '../models/Comment';
import { CustomRequest } from '../middleware/auth';

export const createComment = async (req: CustomRequest, res: Response) => {
  try {
    const { content, parentId } = req.body;
    const { reviewId } = req.params;
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await Comment.create({
      content,
      username,
      reviewId: parseInt(reviewId),
      parentId: parentId ? parseInt(parentId) : null
    } as CommentCreationAttributes);

    console.log('댓글 생성 성공:', comment);

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 생성에 실패했습니다.'
    });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const comments = await Comment.findAll({
      where: { reviewId: parseInt(reviewId) },
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글을 불러오는데 실패했습니다.'
    });
  }
};

export const deleteComment = async (req: CustomRequest, res: Response) => {
  try {
    const { id, reviewId } = req.params;
    const username = req.user?.username;

    const comment = await Comment.findOne({
      where: { 
        id: parseInt(id),
        reviewId: parseInt(reviewId)
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    if (comment.username !== username) {
      return res.status(403).json({
        success: false,
        message: '댓글을 삭제할 권한이 없습니다.'
      });
    }

    await comment.destroy();

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 삭제에 실패했습니다.'
    });
  }
};

export const updateComment = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const username = req.user?.username;

    const comment = await Comment.findOne({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    if (comment.username !== username) {
      return res.status(403).json({
        success: false,
        message: '댓글을 수정할 권한이 없습니다.'
      });
    }

    comment.content = content;
    await comment.save();

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 수정에 실패했습니다.'
    });
  }
};