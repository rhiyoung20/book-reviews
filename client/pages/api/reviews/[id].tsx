import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const response = await axios.get(`${API_URL}/reviews/${id}`);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || '서버 오류가 발생했습니다.'
    });
  }
}
