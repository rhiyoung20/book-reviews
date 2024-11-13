import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
import Review from '../models/Review';
import User from '../models/User';
import { Op } from 'sequelize';
import type { ReviewAttributes } from '../models/Review';

export type CustomRequest = Request & {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
};

export const createReview = async (req: CustomRequest, res: Response) => {
  try {
    const { title, bookTitle, publisher, bookAuthor, content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;

    // 필수 필드 검증
    if (!title?.trim() || !bookTitle?.trim()) {
      return res.status(400).json({ 
        message: '제목과 도서명은 필수 입력 항목입니다.' 
      });
    }

    if (!userId || !username) {
      return res.status(401).json({
        message: '로그인이 필요합니다.'
      });
    }

    const review = await Review.create({
      id: 0,
      title,
      bookTitle,
      publisher: publisher?.trim() || '미입력',
      bookAuthor: bookAuthor?.trim() || '미입력',
      content,
      userId,
      username,
      views: 0
    });

    return res.status(201).json({
      message: '리뷰가 성공적으로 등록되었습니다.',
      review
    });
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    return res.status(500).json({ 
      message: '리뷰 등록 중 오류가 발생했습니다.' 
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
  
      return res.json({
        reviews,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalReviews: count
      });
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error);
      return res.status(500).json({ 
        message: '리뷰 목록을 불러오는 중 오류가 발생했습니다.' 
      });
    }
  };

export const getReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({ 
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    // 조회수 증가
    await review.increment('views');
    await review.reload();

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
    const userId = req.user?.id;

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
    if (review.userId !== userId) {
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
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ 
        message: '리뷰를 찾을 수 없습니다.' 
      });
    }

    // 작성자 본인 또는 관리자만 삭제 가능
    if (review.userId !== userId && !isAdmin) {
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