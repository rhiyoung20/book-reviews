import type { Request, Response } from 'express';
import { Review, User, Comment } from '../models';
import { RequestWithUser } from '../types/auth';
import { Op } from 'sequelize';

// 리뷰 생성
export const createReview = async (req: RequestWithUser, res: Response) => {
  try {
    const { content, title, bookTitle, publisher, bookAuthor } = req.body;
    
    if (!req.user?.username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    if (!title || !bookTitle || !content) {
      return res.status(400).json({
        success: false,
        message: '제목, 책 제목, 내용은 필수 입력사항입니다.'
      });
    }

    const review = await Review.create({
      title,
      bookTitle,
      content,
      username: req.user.username,
      views: 0,
      publisher,
      bookAuthor
    });

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 생성 중 오류가 발생했습니다.'
    });
  }
};

// 리뷰 목록 조회
export const getReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; // 페이지당 항목 수
    const offset = (page - 1) * limit;

    const { type, term } = req.query;
    
    let whereClause = {};
    if (type && term) {
      whereClause = {
        [type === 'title' ? 'title' : 'username']: {
          [Op.like]: `%${term}%`
        }
      };
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return res.json({
      success: true,
      reviews,
      currentPage: page,
      totalPages,
      totalReviews: count
    });
  } catch (error) {
    console.error('리뷰 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 목록을 불러오는데 실패했습니다.'
    });
  }
};

// 리뷰 조회
export const getReview = async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    const review = await Review.findOne({
      where: { id: reviewId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    });

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return res.status(500).json({ 
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다.' 
    });
  }
};

// 리뷰 수정
export const updateReview = async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { title, bookTitle, content, publisher, bookAuthor } = req.body;

    if (!req.user?.username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const existingReview = await Review.findOne({
      where: { 
        id: reviewId,
        username: req.user.username
      }
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }

    await existingReview.update({
      ...(title && { title }),
      ...(bookTitle && { bookTitle }),
      ...(content && { content }),
      ...(publisher && { publisher }),
      ...(bookAuthor && { bookAuthor })
    });

    return res.json({
      success: true,
      review: existingReview
    });
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 수정 중 오류가 발생했습니다.'
    });
  }
};

// 리뷰 삭제
export const deleteReview = async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const existingReview = await Review.findOne({
      where: { 
        id: reviewId,
        username
      }
    });

    if (!existingReview) {
      return res.status(404).json({ 
        success: false,
        message: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.' 
      });
    }

    await existingReview.destroy();

    return res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return res.status(500).json({ 
      success: false,
      message: '리뷰 삭제 중 오류가 발생했습니다.' 
    });
  }
};

// 댓글 작성
export const createComment = async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { content } = req.body;
    
    // 사용자 인증 확인
    if (!req.user?.username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 리뷰 존재 여부 확인
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    // 댓글 생성
    const comment = await Comment.create({
      content,
      username: req.user.username,
      reviewId
    });

    // 생성된 댓글 반환
    return res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 작성 중 오류가 발생했습니다.'
    });
  }
};