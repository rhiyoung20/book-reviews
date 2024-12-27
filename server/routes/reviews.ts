import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { Review, User } from '../models';
import { Op } from 'sequelize';
import verifyToken from '../middleware/auth';
import { CustomRequest } from '../types/auth';

const router = express.Router();

// Define asyncHandler function
const asyncHandler = (fn: (req: CustomRequest, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    fn(req as CustomRequest, res, next).catch(next);
  };
};

// 리뷰 목록 조회
router.get('/', asyncHandler(async (req: CustomRequest, res: Response) => {
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
}));

// 리뷰 수정
router.put('/:id', verifyToken, asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    const { content, title, bookTitle, publisher, bookAuthor } = req.body;
    const reviewId = parseInt(req.params.id);

    if (!req.user?.username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 리뷰 존재 여부 확인
    const existingReview = await Review.findOne({
      where: {
        id: reviewId,
        '$user.username$': req.user.username
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    // 리뷰 업데이트
    await existingReview.update({
      ...(content && { content }),
      ...(title && { title }),
      ...(bookTitle && { bookTitle }),
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
      message: '리뷰를 수정하는데 실패했습니다.'
    });
  }
}));

// 리뷰 삭제
router.delete('/:id', verifyToken, asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    if (!req.user?.username) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 리뷰 존재 여부 확인
    const existingReview = await Review.findOne({
      where: {
        id: reviewId,
        '$user.username$': req.user.username
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
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
      message: '리뷰를 삭제하는데 실패했습니다.'
    });
  }
}));

export default router;