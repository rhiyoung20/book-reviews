import React from 'react';
import { GetServerSideProps } from 'next';
import Header from '@/components/Header';
import axiosInstance from '@/utils/axios';

interface ReviewData {
  id: number;
  title: string;
  content: string;
  username: string;
  bookTitle: string;
  bookAuthor: string;
  publisher: string;
  createdAt: string;
  views: number;
}

interface ReviewDetailProps {
  review?: ReviewData;
  error?: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.id) {
    return { notFound: true };
  }

  try {
    console.log('요청 URL:', `/api/reviews/${params.id}`);
    const response = await axiosInstance.get(`/api/reviews/${params.id}`);
    console.log('서버 응답:', response.data);

    if (!response.data.success || !response.data.review) {
      return { notFound: true };
    }

    return {
      props: {
        review: response.data.review
      }
    };
  } catch (error) {
    console.error('에러 발생:', error);
    return { notFound: true };
  }
};

export default function ReviewDetail({ review, error }: ReviewDetailProps) {
  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 text-center">리뷰를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <Header />
      <article className="mt-8 max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
        <div className="mb-6 text-sm text-gray-600 border-b pb-4">
          <p className="mb-1">작성자: {review.username}</p>
          <p className="mb-1">도서: {review.bookTitle} ({review.bookAuthor} 저)</p>
          <p className="mb-1">출판사: {review.publisher}</p>
          <p className="mb-1">작성일: {review.createdAt 
            ? new Date(review.createdAt).toLocaleDateString('ko-KR')
            : '날짜 정보 없음'}</p>
          <p>조회수: {review.views}</p>
        </div>
        <div className="prose max-w-none">
          {review.content}
        </div>
      </article>

      <div className="mt-8 max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">댓글</h2>
        
        <div className="mb-6">
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="댓글을 작성해주세요"
          />
          <div className="mt-2 flex justify-end">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
              댓글 작성
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium text-sm">사용자</span>
                <span className="text-gray-500 text-xs ml-2">2024-01-03</span>
              </div>
              <div className="space-x-2">
                <button className="text-gray-500 text-xs hover:text-blue-500">수정</button>
                <button className="text-gray-500 text-xs hover:text-red-500">삭제</button>
              </div>
            </div>
            <p className="text-sm text-gray-700">댓글 내용이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}