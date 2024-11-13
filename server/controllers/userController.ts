import express from 'express';
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import type { RequestWithUser } from '../middleware/auth';

// 비밀번호 변경
export const changePassword = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새 비밀번호 해싱 및 업데이트
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return res.status(500).json({ message: '비밀번호 변경에 실패했습니다.' });
  }
};

// 사용자의 리뷰 목록 조회
export const getUserReviews = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const userId = req.params.userId || req.user.id;

    // 다른 사용자의 정보를 요청할 경우 관리자 권한 체크
    if (userId !== req.user.id && req.user.isAdmin !== true) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const reviews = await prisma.$queryRaw`
      SELECT id, title, bookTitle, createdAt, views 
      FROM Review 
      WHERE userId = ${Number(userId)} 
      ORDER BY createdAt DESC
    `;

    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: '리뷰 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 사용자의 댓글 목록 조회
export const getUserComments = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const userId = req.params.userId || req.user.id;

    // 다른 사용자의 정보를 요청할 경우 관리자 권한 체크
    if (userId !== req.user.id && req.user.isAdmin !== true) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const comments = await prisma.$queryRaw`
      SELECT c.id, c.content, c.createdAt, r.id as reviewId, r.title as reviewTitle
      FROM Comment c
      JOIN Review r ON c.reviewId = r.id
      WHERE c.userId = ${Number(userId)}
      ORDER BY c.createdAt DESC
    `;

    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: '댓글 목록 조회 중 오류가 발생했습니다.' });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ 
        available: false, 
        message: '사용자명은 2자 이상이어야 합니다.' 
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUser) {
      return res.status(200).json({ 
        available: false, 
        message: '이미 사용 중인 사용자명입니다.' 
      });
    }

    return res.status(200).json({ 
      available: true, 
      message: '사용 가능한 사용자명입니다.' 
    });
  } catch (error) {
    console.error('사용자명 확인 오류:', error);
    return res.status(500).json({ 
      available: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};