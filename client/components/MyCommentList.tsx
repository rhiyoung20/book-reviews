import React, { useState, useEffect } from 'react';
import { Button } from "./ui/Button";
import Link from 'next/link';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axios';

interface Comment {
  id: number;
  content: string;
  reviewId: number;
  reviewTitle: string;
  createdAt: string;
}

const MyCommentList: React.FC = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async (page: number, sort: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/api/users/comments', {
        params: { page, sort },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setComments(response.data.comments);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('댓글 로딩 오류:', error);
      alert('댓글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage, sortBy);
  }, [currentPage, sortBy]);

  const handleSort = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    fetchComments(1, value);
  };

  const handleEdit = async (commentId: number, content: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.put(`/api/comments/${commentId}`, 
        { content },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        alert('댓글이 수정되었습니다.');
        fetchComments(currentPage, sortBy);
        setEditingCommentId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('댓글이 삭제되었습니다.');
        if (comments.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchComments(currentPage, sortBy);
        }
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
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
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">댓글 내용</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">리뷰 제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingCommentId === comment.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 p-1 border rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(comment.id, editContent)}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    comment.content
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                  <Link href={`/reviews/${comment.reviewId}`}>{comment.reviewTitle}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {editingCommentId !== comment.id && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditContent(comment.content);
                          }}
                        >
                          수정
                        </Button>
                        <Button 
                          variant="solid" 
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                        >
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1 || isLoading}
            className="text-sm"
          >
            이전
          </Button>
          <span className="px-4 py-2 bg-white text-gray-700 text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="text-sm"
          >
            다음
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default MyCommentList; 