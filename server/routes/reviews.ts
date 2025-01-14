import express from 'express';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import verifyToken from '../middleware/auth';
import { RequestWithUser } from '../types/auth';
import { Review, User } from '../models';

const router = express.Router();

// 리뷰 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const type = req.query.type as string;
    const term = req.query.term as string;

    let whereClause = {};
    if (type && term) {
      whereClause = {
        [type]: {
          [Op.like]: `%${term}%`
        }
      };
    }

    const [reviews, total] = await Promise.all([
      Review.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username']
        }],
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      }),
      Review.count({ where: whereClause })
    ]);

    return res.json({
      success: true,
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    console.error('리뷰 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 목록을 불러오는데 실패했습니다.'
    });
  }
});

// 단일 리뷰 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }

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

    await review.increment('views');
    const reviewData = review.toJSON();

    return res.json({
      success: true,
      review: {
        ...reviewData,
        views: reviewData.views + 1
      }
    });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰를 불러오는데 실패했습니다.'
    });
  }
});

// 리뷰 생성
router.post('/', verifyToken, async (req: RequestWithUser, res: Response) => {
  try {
    const { title, content, bookTitle, bookAuthor, publisher } = req.body;
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const review = await Review.create({
      title,
      content,
      bookTitle,
      bookAuthor,
      publisher,
      username
    });

    return res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 생성에 실패했습니다.'
    });
  }
});

// 리뷰 수정
router.put('/:id', verifyToken, async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { title, content, bookTitle, bookAuthor, publisher } = req.body;
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const review = await Review.findOne({
      where: { 
        id: reviewId,
        username
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }

    await review.update({
      ...(title && { title }),
      ...(content && { content }),
      ...(bookTitle && { bookTitle }),
      ...(bookAuthor && { bookAuthor }),
      ...(publisher && { publisher })
    });

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 수정에 실패했습니다.'
    });
  }
});

// 리뷰 삭제
router.delete('/:id', verifyToken, async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const review = await Review.findOne({
      where: {
        id: reviewId,
        username
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }

    await review.destroy();

    return res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '리뷰 삭제에 실패했습니다.'
    });
  }
});

export default router;