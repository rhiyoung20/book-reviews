import React, { useState, useEffect, useContext } from 'react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import axiosInstance from '../utils/axios';
import { UserContext } from '../context/UserContext';
import { IComment } from '@/types';

interface CommentsProps {
  reviewId: string;
}

const Comments: React.FC<CommentsProps> = ({ reviewId }) => {
  const { username } = useContext(UserContext);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/comments/review/${reviewId}`);
      setComments(response.data.comments);
    } catch (err) {
      console.error('댓글 조회 오류:', err);
      setError('댓글을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(
        `/comments/review/${reviewId}`,
        {
          content: newComment,
          parentId: replyTo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      setError('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정
  const handleEditComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/comments/${commentId}`,
        { content: editContent },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingId(null);
      fetchComments();
    } catch (err) {
      console.error('댓글 수정 오류:', err);
      setError('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      console.error('댓글 삭제 오류:', err);
      setError('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">댓글</h3>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={username ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
          disabled={!username}
          className="mb-2"
        />
        <div className="flex justify-end">
          {replyTo && (
            <Button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="mr-2" 
              variant="outline"
            >
              답글 취소
            </Button>
          )}
          <Button type="submit" disabled={!username} variant="outline">
            {replyTo ? '답글 작성' : '댓글 작성'}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className={`p-4 bg-gray-50 rounded ${comment.parentId ? 'ml-8' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold">{comment.username}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              {username === comment.username && (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 text-sm"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            
            {editingId === comment.id ? (
              <div className="mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={() => setEditingId(null)}
                    variant="outline"
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={() => handleEditComment(comment.id)}
                    variant="outline"
                  >
                    수정완료
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2">{comment.content}</p>
                {!comment.parentId && username && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-sm text-blue-600 mt-2"
                  >
                    답글 작성
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;