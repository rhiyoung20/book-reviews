   // client/src/pages/write-review.tsx
   import React, { useState, useContext } from 'react';
   import { useRouter } from 'next/router';
   import { Textarea } from '@/components/ui/Textarea';
   import { Label } from '@/components/ui/Label';
   import axiosInstance from '@/utils/axios';
   import Header from '@/components/Header';
   import { UserContext } from '@/context/UserContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

   export default function WriteReview() {
     const { username } = useContext(UserContext);
     const [title, setTitle] = useState('');
     const [bookTitle, setBookTitle] = useState('');
     const [publisher, setPublisher] = useState('');
     const [bookAuthor, setBookAuthor] = useState('');
     const [content, setContent] = useState('');
     const router = useRouter();
     const [error, setError] = useState<string | null>(null);

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       
       try {
         const token = localStorage.getItem('token');
         if (!token) {
           router.push('/login');
           return;
         }

         if (!title.trim() || !bookTitle.trim() || !content.trim()) {
           setError('필수 입력 항목을 모두 작성해주세요.');
           return;
         }

         const response = await axiosInstance.post('/api/reviews', {
           title,
           bookTitle,
           publisher,
           bookAuthor,
           content
         }, {
           headers: { Authorization: `Bearer ${token}` }
         });

         if (response.data.success) {
           router.push(`/${response.data.review.id}`);
         }
       } catch (error: any) {
         setError(error.response?.data?.message || '리뷰 등록에 실패했습니다.');
       }
     };

     return (
       <div className="container mx-auto px-4 py-8">
         <Header /> {/* 공통 Header 추가 */}
         <div className="max-w-md mx-auto">
           <h1 className="text-2xl font-bold mb-6">리뷰 작성</h1>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <Label htmlFor="title">제목</Label>
               <Input
                 id="title"
                 type="text"
                 placeholder="리뷰 제목을 입력하세요"
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
                 placeholder="도서 제목을 입력하세요"
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
                 placeholder="출판사를 입력하세요(선택 사항)"
                 value={publisher}
                 onChange={(e) => setPublisher(e.target.value)}                 
               />
             </div>
             <div>
               <Label htmlFor="bookAuthor">저자</Label>
               <Input
                 id="bookAuthor"
                 type="text"
                 placeholder="저자를 입력하세요(선택 사항)"
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
                 className="text-xl" // 텍스트 크기 2pt 증가 (text-lg -> text-xl)
               />
             </div>
             <Button type="submit" variant="solid" className="bg-green-600 text-white px-6 py-2">리뷰 등록</Button>
           </form>
           {error && (
             <p className="mt-4 text-sm text-red-500">{error}</p>
           )}
         </div>
       </div>
     );
   }
