import { Request, Response } from 'express';
import { UserModel } from "../models";

export const updateUserAdminStatus = async (req: Request, res: Response) => {
    try {
      // 현재 로그인한 사용자가 관리자인지 확인
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      }
      const isCurrentUserAdmin = Boolean(await UserModel.isAdmin(Number(currentUserId)));
  
      if (!isCurrentUserAdmin) {
        return res.status(403).json({ message: '관리자 권한이 없습니다.' });
      }
  
      const { userId, isAdmin } = req.body;
      const success = await UserModel.updateAdminStatus(userId, isAdmin);
  
      if (success) {
        res.json({ message: '관리자 권한이 업데이트되었습니다.' });
      } else {
        res.status(400).json({ message: '권한 업데이트에 실패했습니다.' });
      }
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  };