import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from 'next/link';
import axiosInstance from '@/utils/axios';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { UserContext } from '@/context/UserContext';

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
  const { page = '1', type, term } = router.query;
  const { checkAuthStatus } = useContext(UserContext);

  const [searchType, setSearchType] = useState<'title' | 'username'>('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    if (type) {
      setSearchType(type as 'title' | 'username');
    }
  }, [type]);

  const fetchReviews = async (page: number, type?: string, term?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/api/reviews?page=${page}`;
      if (type && term) {
        url += `&type=${type}&term=${encodeURIComponent(term)}`;
      }
      
      console.log('요청 URL:', url);
      const response = await axiosInstance.get<ReviewsResponse>(url);
      console.log('서버 응답:', response.data);
      
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      setTotalResults(response.data.totalReviews);
      
      if (response.data.reviews.length === 0 && !term) {
        setError('등록된 리뷰가 없습니다.');
      }
    } catch (err: any) {
      console.error('리뷰 목록 조회 오류:', err.response || err);
      setError(
        err.response?.data?.message || 
        '리뷰 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (isSearched) {
      setIsSearched(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearched(true);
      router.push({
        pathname: '/',
        query: {
          page: 1,
          type: searchType,
          term: searchTerm.trim()
        }
      });
    } else {
      setIsSearched(false);
      router.push('/');
    }
  };

  useEffect(() => {
    const validateAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
    };
    
    validateAuth();
  }, []);

  useEffect(() => {
    const currentPage = parseInt(page as string) || 1;
    
    if (isSearched && type && term) {
      fetchReviews(currentPage, type as string, term as string);
    } else if (!isSearched) {
      fetchReviews(currentPage);
    }
  }, [page, isSearched]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    router.push({
      pathname: '/',
      query: {
        page: newPage,
        ...(searchType && searchTerm && {
          type: searchType,
          term: searchTerm
        })
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 pt-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-8 gap-4 mt-4">
          <div className="flex gap-2 flex-1 max-w-xl items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'title' | 'username')}
              className="w-32 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="title">제목</option>
              <option value="username">글쓴이</option>
            </select>
            <Input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyPress={handleKeyPress}
              className="flex-1 h-9 text-sm"
            />
            <Button
              variant="solid"
              onClick={handleSearch}
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              검색
            </Button>
          </div>
          <Link href="/write-review">
            <Button variant="solid" className="h-9 bg-green-600 hover:bg-[#3f7535] text-sm">리뷰 작성</Button>
          </Link>
        </div>

        {isSearched && searchTerm && (
          <div className="mb-4 text-gray-700">
            <p className="font-medium">
              '{searchTerm}' 검색 결과 ({totalResults}건)
            </p>
          </div>
        )}

        {isSearched && searchTerm && reviews.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden my-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">글쓴이</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                      {review.id}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <Link href={`/${review.id}`}>
                        <span className="text-blue-600 hover:text-blue-900 cursor-pointer text-xs">
                          {review.title}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                      {review.username}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                      {review.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reviews.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-1">
            <Button
              variant="solid"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-blue-20 hover:bg-blue-100 text-black border-0 text-xs px-1"
            >
              이전
            </Button>
            <span className="py-2 px-4 text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="solid"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-blue-20 hover:bg-blue-100 text-black border-0 text-xs px-1"
            >
              다음
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomeComponent;