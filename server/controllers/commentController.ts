import type { Response } from 'express';
import { CustomRequest } from '../types/auth';
import prisma from '../lib/prisma';
import { User } from '../models';

// 댓글 생성
export const createComment = async (req: CustomRequest, res: Response) => {
  try {
    const { content } = req.body;
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        reviewId: parseInt(reviewId)
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      comment
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
export const getComments = async (req: CustomRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { 
        reviewId: parseInt(reviewId) 
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글을 불러오는데 실패했습니다.'
    });
  }
};

// 사용자별 댓글 조회
export const getUserComments = async (req: CustomRequest, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          user: {
            username
          }
        },
        include: {
          review: true,
          user: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip
      }),
      prisma.comment.count({
        where: {
          user: {
            username
          }
        }
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
export const updateComment = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '댓글을 수정할 권한이 없습니다.'
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    return res.json({
      success: true,
      comment: updatedComment
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
export const deleteComment = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const username = req.user?.username;

    if (!userId || !username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    if (comment.userId !== userId && !User.isAdminUsername(username)) {
      return res.status(403).json({
        success: false,
        message: '댓글을 삭제할 권한이 없습니다.'
      });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

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