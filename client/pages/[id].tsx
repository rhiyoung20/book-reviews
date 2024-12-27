import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import axiosInstance from '@/utils/axios';

interface ReviewDetailProps {
  initialReview: {
    id: number;
    title: string;
    content: string;
    username: string;
    createdAt: string;
    // ... 기타 필요한 속성
  } | null;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ initialReview }) => {
  const router = useRouter();
  const { username: user } = useUser();

  if (!initialReview) {
    return (
      <div className="container mx-auto px-4">
        <Header />
        <div className="text-center py-10">
          리뷰를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <Header />
      <main className="mt-8">
        <h1 className="text-2xl font-bold mb-4">{initialReview.title}</h1>
        <div className="mb-4 text-gray-600">
          <span>작성자: {initialReview.username}</span>
          <span className="mx-2">|</span>
          <span>작성일: {new Date(initialReview.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="prose max-w-none">
          {initialReview.content}
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  try {
    const response = await axiosInstance.get(`/api/reviews/${id}`);
    return {
      props: {
        initialReview: response.data
      }
    };
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    return {
      props: {
        initialReview: null
      }
    };
  }
};

export default ReviewDetail;