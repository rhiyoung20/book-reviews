import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';
import Header from '@/components/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { UserContext } from '@/context/UserContext';
import { Textarea } from '@/components/ui/Textarea';

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

interface Comment {
  id: number;
  content: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
}

const ReviewDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { username } = useContext(UserContext);
  const [review, setReview] = useState<IReview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchReview();
    fetchComments();
  }, [id]);

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

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/${id}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('댓글 불러오기 실패:', err);
      setComments([]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await axiosInstance.post(`/reviews/${id}/comments`, 
        {
          content: newComment.trim(),
          parentId: replyTo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('댓글 작성 성공:', response.data);

      if (response.data.success) {
        setNewComment('');
        setReplyTo(null);
        await fetchComments();
      } else {
        setError('댓글 작성에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('댓글 작성 실패:', err);
      setError(err.response?.data?.message || '댓글 작성에 실패했습니다.');
    }
  };

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

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">댓글</h2>
          
          {username ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요"
                className="mb-2"
              />
              {replyTo && (
                <div className="text-sm text-gray-600 mb-2">
                  답글 작성 중... 
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="ml-2 text-red-500"
                  >
                    취소
                  </button>
                </div>
              )}
              <Button variant="solid" type="submit">댓글 등록</Button>
            </form>
          ) : (
            <p className="mb-4 text-gray-600">댓글을 작성하려면 로그인이 필요합니다.</p>
          )}

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-4 rounded-md ${
                    comment.parentId ? 'ml-8 bg-gray-50 border-l-4 border-blue-200' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {comment.parentId && (
                        <span className="text-sm text-blue-500 mb-2 inline-block">
                          ↳ 답글
                        </span>
                      )}
                      <p className="text-sm font-bold text-green-700 -indent-4 pl-4">
                        {comment.username}
                      </p>
                      <p className="mt-1 text-base pl-3">
                        {comment.content}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {!comment.parentId && username && (
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-sm text-blue-500 mt-2 hover:text-blue-700"
                        >
                          답글 달기
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {replyTo === comment.id && (
                    <div className="mt-4 ml-4">
                      <form onSubmit={handleCommentSubmit}>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="답글을 작성해주세요"
                          className="w-full mb-2"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" variant="solid">답글 등록</Button>
                          <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                            취소
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                작성된 댓글이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;