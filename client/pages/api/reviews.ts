import axios from 'axios';
import { ReviewData } from '../../types/review';

const BASE_URL = '/api';

// 리뷰 목록 조회
export const getReviews = async (page = 1, type?: string, term?: string) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (type) params.append('type', type);
  if (term) params.append('term', term);
  
  const response = await axios.get(`${BASE_URL}/reviews?${params}`);
  return response.data;
};

// 리뷰 상세 조회
export const getReview = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/reviews/${id}`);
  return response.data;
};

// 리뷰 생성
export const createReview = async (reviewData: ReviewData) => {
  const response = await axios.post(`${BASE_URL}/reviews`, reviewData);
  return response.data;
};

// 리뷰 수정
export const updateReview = async (id: number, reviewData: Partial<ReviewData>) => {
  const response = await axios.put(`${BASE_URL}/reviews/${id}`, reviewData);
  return response.data;
};

// 리뷰 삭제
export const deleteReview = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}/reviews/${id}`);
  return response.data;
};
