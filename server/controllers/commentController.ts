import type { Response } from 'express';
import { RequestWithUser } from '../types/auth';
import { Comment, Review, User } from '../models';

// 댓글 생성
export const createComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { content } = req.body;
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
      reviewId: parseInt(reviewId)
    });

    const commentWithUser = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    });

    return res.status(201).json({
      success: true,
      comment: commentWithUser
    });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 생성에 실패했습니다.'
    });
  }
};

// 댓글 목록 조회
export const getComments = async (req: RequestWithUser, res: Response) => {
  try {
    const { reviewId } = req.params;
    
    const comments = await Comment.findAll({
      where: { 
        reviewId: parseInt(reviewId) 
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }],
      order: [['createdAt', 'ASC']],
      raw: true,
      nest: true
    });

    return res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글을 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

// 사용자별 댓글 조회
export const getUserComments = async (req: RequestWithUser, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.findAll({
        where: { username },
        include: [{
          model: Review,
          as: 'review'
        }, {
          model: User,
          as: 'user',
          attributes: ['username']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      }),
      Comment.count({
        where: { username }
      })
    ]);

    return res.json({
      success: true,
      comments,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('사용자 댓글 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글을 불러오는데 실패했습니다.'
    });
  }
};

// 댓글 수정
export const updateComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

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

    await comment.update({ content });

    return res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 수정에 실패했습니다.'
    });
  }
};

// 댓글 삭제
export const deleteComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

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
        message: '댓글을 삭제할 권한이 없습니다.'
      });
    }

    await comment.destroy();

    return res.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 삭제에 실패했습니다.'
    });
  }
};