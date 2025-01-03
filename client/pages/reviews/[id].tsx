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
    const response = await axiosInstance.get(`/reviews/${params.id}`);
    console.log('[Server] Response data:', response.data);

    if (!response.data.success) {
      return { notFound: true };
    }

    return {
      props: {
        review: {
          ...response.data.review,
          createdAt: new Date(response.data.review.createdAt).toISOString(),
        },
      },
    };
  } catch (error) {
    console.error('[Server] Error:', error);
    return { notFound: true };
  }
};

export default function ReviewDetail({ review, error }: ReviewDetailProps) {
  // 에러가 있을 경우
  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  // 리뷰 데이터 자체가 없을 경우
  if (!review) {
    return (
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 text-center">리뷰를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 정상 렌더링
  return (
    <div className="container mx-auto px-4">
      <Header />
      <article className="mt-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
        <div className="mb-4 text-sm text-gray-600">
          <p>작성자: {review.username}</p>
          <p>도서: {review.bookTitle} ({review.bookAuthor} 저)</p>
          <p>출판사: {review.publisher}</p>
          <p>작성일: {new Date(review.createdAt).toLocaleDateString()}</p>
          <p>조회수: {review.views}</p>
        </div>
        <div className="prose max-w-none">
          {review.content}
        </div>
      </article>
    </div>
  );
}