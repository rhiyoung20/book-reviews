import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import Review from '../models/Review';
import User from '../models/User';
import { Op } from 'sequelize';

export type CustomRequest = Request & {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
};

export const createReview = async (req: CustomRequest, res: Response) => {
  try {
    const username = req.user?.username;
    
    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const review = await Review.create({
      ...req.body,
      username,
      views: 0
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 생성 중 오류가 발생했습니다.'
    });
  }
};

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
          [searchType === 'title' ? 'title' : 'username']: {
            [Op.like]: `%${searchTerm}%`
          }
        };
      }
  
      console.log('Query parameters:', { page, searchType, searchTerm });
      console.log('Where clause:', whereClause);

      const { count, rows: reviews } = await Review.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'title',
          'username',
          'createdAt',
          'views'
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
  
      console.log('Found reviews:', reviews.length);

      return res.json({
        reviews: reviews.map(review => review.get({ plain: true })),
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

export const getReview = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const username = req.user?.username;
    
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({ 
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    if (username && review.username !== username) {
      await review.increment('views');
      await review.reload();
    }

    return res.json({ review });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return res.status(500).json({ 
      message: '리뷰 조회 중 오류가 발생했습니다.' 
    });
  }
};

export const updateReview = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, bookTitle, publisher, bookAuthor, content } = req.body;
    const username = req.user?.username;

    // 필수 필드 검증
    if (!title?.trim() || !bookTitle?.trim()) {
      return res.status(400).json({ 
        message: '제목과 도서명은 필수 입력 항목입니다.' 
      });
    }

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ 
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    // 작성자 본인만 수정 가능
    if (review.username !== username) {
      return res.status(403).json({ 
        message: '리뷰 수정 권한이 없습니다.' 
      });
    }

    await review.update({
      title,
      bookTitle,
      publisher: publisher?.trim() || '미입력',
      bookAuthor: bookAuthor?.trim() || '미입력',
      content
    });

    return res.json({
      message: '리뷰가 성공적으로 수정되었습니다.',
      review
    });
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return res.status(500).json({ 
      message: '리뷰 수정 중 오류가 발생했습니다.' 
    });
  }
};

export const deleteReview = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const username = req.user?.username;
    const isAdmin = req.user?.isAdmin;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ 
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    // 작성자 본인 또는 관리자만 삭제 가능
    if (review.username !== username && !isAdmin) {
      return res.status(403).json({ 
        message: '리뷰 삭제 권한이 없습니다.' 
      });
    }

    await review.destroy();

    return res.json({ 
      message: '리뷰가 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return res.status(500).json({ 
      message: '리뷰 삭제 중 오류가 발생했습니다.' 
    });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { username },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      reviews,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('사용자 리뷰 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰를 불러오는데 실패했습니다.'
    });
  }
};