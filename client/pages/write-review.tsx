import { useEffect } from 'react';
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "@/components/Header";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { axiosInstance } from "@/lib/axios";

export default function WriteReview() {
  const router = useRouter();
  const { username } = useUser() || {};
  const [title, setTitle] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/?showLoginModal=true');
      return;
    }
  }, [router]);

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/?showLoginModal=true');
        return;
      }

      console.log('리뷰 등록 시도:', { title, bookTitle, content });

      const response = await axiosInstance.post('/api/reviews', {
        title,
        bookTitle,
        publisher,
        bookAuthor,
        content,
        username
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        router.push('/');
      } else {
        setError('리뷰 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 등록 오류:', error.response || error);
      setError(error.response?.data?.message || '리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center">
              <span className="text-sm font-medium leading-none w-20">제목</span>
              <Input
                id="title"
                type="text"
                placeholder="리뷰 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="flex-1"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium leading-none w-20">도서 제목</span>
              <Input
                id="bookTitle"
                type="text"
                placeholder="도서 제목을 입력하세요"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                className="flex-1"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium leading-none w-20">출판사</span>
              <Input
                id="publisher"
                type="text"
                placeholder="출판사를 입력하세요(선택 사항)"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium leading-none w-20">저자</span>
              <Input
                id="bookAuthor"
                type="text"
                placeholder="저자를 입력하세요(선택 사항)"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium leading-none block">내용</span>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="w-full text-xl"
              />
            </div>
            <div className="flex justify-end space-x-6 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="px-4 py-1 bg-gray-100 hover:bg-gray-200"
              >
                취소
              </Button>
              <Button 
                type="submit" 
                variant="solid" 
                className="px-4 py-1 bg-green-600 text-white hover:bg-green-700"
              >
                등록
              </Button>
            </div>
          </form>
          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}