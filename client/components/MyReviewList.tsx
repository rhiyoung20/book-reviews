import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/Button";
import Link from 'next/link';
import axiosInstance from '../utils/axios';
import { useRouter } from 'next/router';

interface Review {
  id: number;
  title: string;
  bookTitle: string;
  createdAt: string;
  views: number;
}

const MyReviewList: React.FC = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = async (page: number, sort: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/users/reviews', {
        params: { page, sort },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage, sortBy);
  }, [currentPage, sortBy]);

  const handleSort = (value: string) => {
    setSortBy(value);
    fetchReviews(1, value);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end items-center">
        <div className="flex items-center">
          <select 
            value={sortBy} 
            onChange={(e) => handleSort(e.target.value)} 
            className="border p-2 rounded"
            disabled={isLoading}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="most-viewed">조회수 높은순</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">책 제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                  <Link href={`/reviews/${review.id}`}>{review.title}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.bookTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <Button
            variant="outline"
            onClick={() => fetchReviews(currentPage - 1, sortBy)}
            disabled={currentPage === 1}
            className="text-sm"
          >
            이전
          </Button>
          <span className="px-4 py-2 bg-white text-gray-700 text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchReviews(currentPage + 1, sortBy)}
            disabled={currentPage === totalPages}
            className="text-sm"
          >
            다음
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default MyReviewList; 