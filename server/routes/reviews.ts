import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { Op } from 'sequelize';
import { authenticate } from '../middleware/auth';
import { RequestWithUser } from '../types/auth';
import { Review, User } from '../models';

const router = express.Router();

// 타입 안전한 비동기 핸들러
const asyncHandler = (
  fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as RequestWithUser, res, next).catch(next);
  };
};

// 리뷰 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['username'],
          required: false  // LEFT JOIN 유지
        }],
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      }),
      Review.count()
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
router.post('/', authenticate, asyncHandler(async (req: RequestWithUser, res: Response) => {
  try {
    const { title, content, bookTitle, bookAuthor, publisher } = req.body;
    const username = req.user?.username;

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
      username,
      publisher,
      bookAuthor
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
}));

// 리뷰 수정
router.put('/:id', authenticate, asyncHandler(async (req: RequestWithUser, res: Response) => {
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
}));

// 리뷰 삭제
router.delete('/:id', authenticate, asyncHandler(async (req: RequestWithUser, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const username = req.user?.username;

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
}));

export default router;