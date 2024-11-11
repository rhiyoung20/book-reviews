import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import axiosInstance from '@/utils/axios';
import Header from '@/components/Header';
import { UserContext } from '@/context/UserContext';

export default function EditReview() {
  const { username } = useContext(UserContext);
  const router = useRouter();
  const { id } = router.query;
  
  const [title, setTitle] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 기존 리뷰 데이터 불러오기
  useEffect(() => {
    if (!id) return;

    const fetchReview = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axiosInstance.get(`/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const review = response.data.review;
        setTitle(review.title);
        setBookTitle(review.bookTitle);
        setPublisher(review.publisher);
        setBookAuthor(review.bookAuthor);
        setContent(review.content);
        setIsLoading(false);
      } catch (error: any) {
        console.error('리뷰 조회 오류:', error);
        setError('리뷰를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axiosInstance.put(`/reviews/${id}`, {
        title,
        bookTitle,
        publisher,
        bookAuthor,
        content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('리뷰가 성공적으로 수정되었습니다.');
      router.push(`/${id}`);  // 수정된 리뷰의 상세 페이지로 이동
    } catch (error: any) {
      console.error('리뷰 수정 오류:', error);
      setError(error.response?.data?.message || '리뷰를 수정할 수 없습니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">리뷰 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="bookTitle">도서 제목</Label>
            <Input
              id="bookTitle"
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="publisher">출판사</Label>
            <Input
              id="publisher"
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bookAuthor">저자</Label>
            <Input
              id="bookAuthor"
              type="text"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="text-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline">수정 완료</Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
          </div>
        </form>
        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}