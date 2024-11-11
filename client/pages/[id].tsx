import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';
import Header from '@/components/Header';
import Comments from '@/components/Comments';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { UserContext } from '@/context/UserContext';

interface IReview {
  id: string;
  title: string;
  content: string;
  bookTitle: string;
  bookAuthor: string;
  publisher: string;
  username: string;
  createdAt: string;
  views: number;
}

const ReviewDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { username } = useContext(UserContext);
  const [review, setReview] = useState<IReview | null>(null); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReview = async () => {
      try {
        const response = await axiosInstance.get(`/reviews/${id}`);
        setReview(response.data.review);
      } catch (err: any) {
        console.error('리뷰 가져오기 오류:', err);
        setError('리뷰를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await axiosInstance.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('리뷰가 성공적으로 삭제되었습니다.');
      router.push('/');
    } catch (err: any) {
      console.error('리뷰 삭제 오류:', err);
      alert(err.response?.data?.message || '리뷰 삭제에 실패했습니다.');
    }
  };

  if (isLoading) return <div className="text-center mt-8">로딩 중...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!review) return <div className="text-center mt-8">리뷰를 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p><strong>도서 제목:</strong> {review.bookTitle}</p>
            <p><strong>작성자:</strong> {review.username}</p>
            <p><strong>출판사:</strong> {review.publisher}</p>
            <p><strong>저자:</strong> {review.bookAuthor}</p>
            <p><strong>작성일:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
            <p><strong>조회수:</strong> {review.views}</p>
          </div>

          <div className="mt-6 mb-8 prose max-w-none">
            <p>{review.content}</p>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Link href="/">
              <Button variant="outline">목록으로</Button>
            </Link>

            {username === review.username && (
              <div className="space-x-2">
                <Link href={`/edit-review/${id}`}>
                  <Button variant="outline">수정</Button>
                </Link>
                <Button 
                  variant="solid" 
                  onClick={handleDelete}
                  className="cursor-pointer"
                >
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>

        <Comments reviewId={id as string} />
      </div>
    </div>
  );
};

export default ReviewDetail;