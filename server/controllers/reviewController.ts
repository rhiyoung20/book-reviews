import type { Request, Response } from 'express';
import { sequelize } from '../models';
import { User, Review, Comment } from '../models';
import { RequestWithUser } from '../types/auth';
import { Op } from 'sequelize';

// 리뷰 생성
export const createReview = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const { content, title, bookTitle, publisher, bookAuthor } = req.body;
    const username = req.user?.username;

    if (!username) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    if (!title || !bookTitle || !content) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: '제목, 책 제목, 내용은 필수 입력사항입니다.'
      });
    }

    const review = await Review.create({
      title,
      bookTitle,
      content,
      username,
      publisher,
      bookAuthor
    }, { transaction: t });

    await t.commit();

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 생성 중 오류 발생:', error);
    try {
      await t.rollback();
      console.error('트랜잭션 롤백 완료');
    } catch (rollbackError) {
      console.error('트랜잭션 롤백 실패:', rollbackError);
    }
    return res.status(500).json({ success: false, message: '리뷰 생성 실패' });
  }
};

// 리뷰 목록 조회
export const getReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const searchType = req.query.type as string;
    const searchTerm = req.query.term as string;

    let whereClause = {};
    if (searchType && searchTerm) {
      whereClause = {
        [searchType]: {
          [Op.like]: `%${searchTerm}%`
        }
      };
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalReviews: count
    });
  } catch (error) {
    console.error('상세 에러 정보:', error);
    return res.status(500).json({ 
      message: '리뷰 목록을 불러오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

// 리뷰 조회
export const getReview = async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    const review = await Review.findByPk(reviewId, {
      include: [{
        model: Comment,
        as: 'comments',
        include: [{
          model: User,
          as: 'user',
          attributes: ['username']
        }]
      }]
    });

    if (!review) {
      return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    }

    return res.json(review);
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return res.status(500).json({ message: '리뷰 조회 중 오류가 발생했습니다.' });
  }
};

// 리뷰 수정
export const updateReview = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const reviewId = parseInt(req.params.id);
    const { title, bookTitle, content, publisher, bookAuthor } = req.body;
    const username = req.user?.username;

    if (!username) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const review = await Review.findOne({
      where: {
        id: reviewId,
        username
      },
      transaction: t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }

    await review.update({
      title,
      bookTitle,
      content,
      publisher,
      bookAuthor
    }, { transaction: t });

    await t.commit();

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    await t.rollback();
    console.error('리뷰 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 수정 중 오류가 발생했습니다.'
    });
  }
};

// 리뷰 삭제
export const deleteReview = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const reviewId = parseInt(req.params.id);
    const username = req.user?.username;

    if (!username) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 리뷰 존재 여부와 권한 확인
    const review = await Review.findOne({
      where: {
        id: reviewId,
        username
      },
      transaction: t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }

    // 먼저 관련된 댓글들을 삭제
    await Comment.destroy({
      where: { reviewId },
      transaction: t
    });

    // 그 다음 리뷰 삭제
    await review.destroy({ transaction: t });
    await t.commit();

    return res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('리뷰 삭제 중 오류 발생:', error);
    try {
      await t.rollback();
      console.error('트랜잭션 롤백 완료');
    } catch (rollbackError) {
      console.error('트랜잭션 롤백 실패:', rollbackError);
    }
    return res.status(500).json({ success: false, message: '리뷰 삭제 실패' });
  }
};

// 댓글 생성
export const createComment = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const reviewId = parseInt(req.params.id);
    const { content } = req.body;
    const username = req.user?.username;

    if (!username) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    if (!content) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: '댓글 내용은 필수 입력사항입니다.'
      });
    }

    const comment = await Comment.create({
      content,
      username,
      reviewId
    }, { transaction: t });

    await t.commit();

    return res.json({
      success: true,
      comment
    });
  } catch (error) {
    await t.rollback();
    console.error('댓글 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 생성 중 오류가 발생했습니다.'
    });
  }
};

// 댓글 목록 조회
export const getComments = async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);

    const comments = await Comment.findAll({
      where: { reviewId },
      order: [['createdAt', 'ASC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    });

    return res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

// 댓글 수정
export const updateComment = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    const username = req.user?.username;

    if (!username) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        username
      },
      transaction: t
    });

    if (!comment) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }

    await comment.update({ content }, { transaction: t });
    await t.commit();

    return res.json({
      success: true,
      comment
    });
  } catch (error) {
    await t.rollback();
    console.error('댓글 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 수정 중 오류가 발생했습니다.'
    });
  }
};

// 댓글 삭제
export const deleteComment = async (req: RequestWithUser, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const commentId = parseInt(req.params.commentId);
    const reviewId = parseInt(req.params.id);

    if (!req.user) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        reviewId,
        username: req.user.username
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.'
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
      message: '댓글 삭제 중 오류가 발생했습니다.'
    });
  }
};