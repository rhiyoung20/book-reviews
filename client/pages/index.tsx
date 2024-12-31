import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import axiosInstance from '@/utils/axios';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { useUser } from '@/context/UserContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

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
  const { 
    page, 
    type, 
    term, 
    showLoginModal, 
    showSignupModal,
    token, 
    username: queryUsername, 
    status,
    errorMessage
  } = router.query;
  const { username, setUsername } = useUser();

  useEffect(() => {
    const handleSocialAuthResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const username = urlParams.get('username');
      const status = urlParams.get('status');

      console.log('URL 파라미터:', { token, username, status });

      if (token && username && status === 'success') {
        try {
          const decodedUsername = decodeURIComponent(username);
          
          // 로컬 스토리지에 저장
          localStorage.setItem('token', token);
          localStorage.setItem('username', decodedUsername);
          
          // Context 업데이트
          setUsername(decodedUsername);
          
          // URL 파라미터 제거
          router.replace('/', undefined, { shallow: true });
        } catch (err) {
          console.error('소셜 로그인 처리 오류:', err);
        }
      }
    };

    handleSocialAuthResponse();
  }, []);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchType, setSearchType] = useState<'title' | 'username'>('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  // 모달 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    const currentP = parseInt(page as string, 10) || 1;
    fetchReviews(currentP);
  }, [page]);

  // 검색 타입 초기설정
  useEffect(() => {
    if (type) {
      setSearchType(type as 'title' | 'username');
    }
  }, [type]);

  // 검색어 적용
  useEffect(() => {
    const currentP = parseInt(page as string, 10) || 1;
    if (isSearched && type && term) {
      fetchReviews(currentP, type as string, term as string);
    } else if (!isSearched) {
      fetchReviews(currentP);
    }
  }, [page, type, term, isSearched]);

  const fetchReviews = async (page: number, type?: string, term?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `/api/reviews?page=${page}`;
      if (type && term) {
        url += `&type=${type}&term=${encodeURIComponent(term)}`;
      }

      const response = await axiosInstance.get<ReviewsResponse>(url);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      setTotalResults(response.data.totalReviews);

      if (response.data.reviews.length === 0 && !term) {
        setError('등록된 리뷰가 없습니다.');
      }
    } catch (err: any) {
      console.error('리뷰 목록 조회 오류:', err);
      setError(err.response?.data?.message || '리뷰 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
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

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (isSearched) {
      setIsSearched(false);
    }
  };

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

  // 모달 토글
  useEffect(() => {
    // 소셜 로그인 성공 시에는 모달을 표시하지 않음
    if (token && queryUsername && status === 'success') {
      setIsLoginModalOpen(false);
      setIsSignupModalOpen(false);
      return;
    }

    // showLoginModal이 true이고 errorMessage가 있을 때만 로그인 모달 표시
    if (showLoginModal && errorMessage && !localStorage.getItem('token')) {
      setIsLoginModalOpen(true);
      setIsSignupModalOpen(false);
    } else if (showSignupModal && !localStorage.getItem('token')) {
      setIsSignupModalOpen(true);
      setIsLoginModalOpen(false);
    } else {
      setIsLoginModalOpen(false);
      setIsSignupModalOpen(false);
    }
  }, [showLoginModal, showSignupModal, token, queryUsername, status, errorMessage]);

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    router.push('/', undefined, { shallow: true });
  };

  // error state를 사용하는 대신 errorMessage 쿼리 파라미터 사용
  useEffect(() => {
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage as string));
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 pt-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 검색 UI */}
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
            <Button
              variant="solid"
              className="h-9 px-3 bg-green-600 hover:bg-[#3f7535] text-white text-sm font-medium"
            >
              리뷰 작성
            </Button>
          </Link>
        </div>

        {/* 검색 결과 */}
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

        {/* 리뷰 리스트 */}
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

        {/* 페이지네이션 */}
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

      {/* 로그인 모달 */}
      {isLoginModalOpen && (
        <LoginForm
          onClose={handleCloseModal}
          switchToSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      )}

      {/* 회원가입 모달 */}
      {isSignupModalOpen && (
        <SignupForm
          onClose={handleCloseModal}
          switchToLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default HomeComponent;