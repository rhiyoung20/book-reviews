import pool from '../config/database';

export interface Comment {
  id?: number;
  content: string;
  userId: number;
  username?: string;
  reviewId: number;
  parentId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommentModel {
  static async create(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'username'>): Promise<Comment> {
    const result = await pool.models.Comment.create({
      content: comment.content,
      userId: comment.userId,
      reviewId: comment.reviewId,
      parentId: comment.parentId
    });
    return result.toJSON();
  }

  static async findById(id: number): Promise<Comment | null> {
    const comment = await pool.models.Comment.findOne({
      include: [{
        model: pool.models.User,
        attributes: ['username']
      }],
      where: { id }
    });
    return comment?.toJSON() || null;
  }

  static async findByReviewId(reviewId: number): Promise<Comment[]> {
    const comments = await pool.models.Comment.findAll({
      include: [{
        model: pool.models.User,
        attributes: ['username']
      }],
      where: { reviewId },
      order: [['createdAt', 'DESC']]
    });
    return comments.map(comment => comment.toJSON());
  }

  static async update(id: number, content: string): Promise<boolean> {
    await pool.models.Comment.update(
      { content },
      { where: { id } }
    );
    return true;
  }

  static async delete(id: number): Promise<boolean> {
    await pool.models.Comment.destroy({
      where: { id }
    });
    return true;
  }
}

export default CommentModel;