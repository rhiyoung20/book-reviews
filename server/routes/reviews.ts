import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { Review, User } from '../models';
import { Op } from 'sequelize';
import verifyToken from '../middleware/auth';
import { RequestWithUser } from '../types/auth';

// Review 모델의 속성 타입 정의
interface ReviewAttributes {
  id: number;
  title: string;
  bookTitle: string;
  publisher?: string;
  bookAuthor?: string;
  content: string;
  username: string;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Review 생성 시 필요한 속성만 정의한 인터페이스
type CreateReviewData = Omit<ReviewAttributes, 'id' | 'views' | 'createdAt' | 'updatedAt'>;

const router = express.Router();

// Define asyncHandler function
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// 리뷰 목록 조회
router.get('/', asyncHandler(async (req: Request, res: Response) => {
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
router.put('/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { content, title, bookTitle, publisher, bookAuthor } = req.body;
  const reviewId = parseInt(req.params.id);
  const user = (req as RequestWithUser).user;
  
  if (!user?.username) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  // 리뷰 존재 여부 확인
  const existingReview = await Review.findOne({
    where: {
      id: reviewId,
      '$user.username$': user.username
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
}));

// 리뷰 삭제
router.delete('/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const reviewId = parseInt(req.params.id);
  const user = (req as RequestWithUser).user;
  
  if (!user?.username) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  // 리뷰 존재 여부 확인
  const existingReview = await Review.findOne({
    where: {
      id: reviewId,
      '$user.username$': user.username
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
}));

// 리뷰 생성
router.post('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { title, bookTitle, publisher, bookAuthor, content } = req.body;
  const user = (req as RequestWithUser).user;
  
  if (!user?.username) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  // 필수 필드 검증
  if (!title || !bookTitle || !content) {
    return res.status(400).json({
      success: false,
      message: '필수 항목이 누락되었습니다.'
    });
  }

  // 리뷰 생성 데이터 준비
  const reviewData = {
    title,
    bookTitle,
    publisher,
    bookAuthor,
    content,
    username: user.username,
    views: 0  // 명시적으로 초기값 설정
  };

  // 리뷰 생성
  const review = await Review.create(reviewData as ReviewAttributes);

  return res.status(201).json({
    success: true,
    review
  });      
}));

export default router;