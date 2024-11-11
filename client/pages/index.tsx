import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from 'next/link';
import axiosInstance from '@/utils/axios';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';
import Header from '@/components/Header';

interface Review {
  id: number;
  title: string;
  username: string;
  createdAt: string;
  views: number;
}

interface ReviewsResponse {
  reviews: Review[];
  currentPage: number;
  totalPages: number;
  totalReviews: number;
}

function HomeComponent() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'title' | 'username'>('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (page: number, type?: string, term?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/reviews?page=${page}`;
      if (type && term) {
        url += `&type=${type}&term=${encodeURIComponent(term)}`;
      }
      
      const response = await axiosInstance.get<ReviewsResponse>(url);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('리뷰 목록 조회 오류:', err);
      if (err.code === 'ECONNABORTED') {
        setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('리뷰 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchReviews(1, searchType, searchTerm);
    } else {
      fetchReviews(1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 flex-1 max-w-2xl items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'title' | 'username')}
              className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="title">제목</option>
              <option value="username">작성자</option>
            </select>
            <Input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-10"
            />
            <Button
              variant="solid"
              onClick={handleSearch}
              className="h-8 px-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              검색
            </Button>
          </div>
          <Link href="/write-review">
            <Button variant="solid" className="bg-blue-600 hover:bg-blue-700">리뷰 작성</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">글쓴이</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review, index) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(currentPage - 1) * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/${review.id}`}>
                      <span className="text-blue-600 hover:text-blue-900 cursor-pointer">
                        {review.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.views}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => fetchReviews(currentPage - 1, searchType, searchTerm)}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          <span className="py-2 px-4">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchReviews(currentPage + 1, searchType, searchTerm)}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      </main>
    </div>
  );
}

export default HomeComponent;