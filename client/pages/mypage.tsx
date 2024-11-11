import { useState, useEffect, useContext } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Link from 'next/link'
import axios from 'axios'
import Header from '@/components/Header'
import { UserContext } from '@/context/UserContext'
import { useRouter } from 'next/router'
import axiosInstance from '@/utils/axios'

interface Review {
  id: string;
  title: string;
  date: string;
}

interface Comment {
  id: string;
  content: string;
  date: string;
}

export default function MyPage() {
  const { username } = useContext(UserContext); // 사용자명 가져오기
  const [activeTab, setActiveTab] = useState("profile")
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [userComments, setUserComments] = useState<Comment[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    // 사용자의 리뷰와 댓글을 가져오는 함수
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // API 경로 수정
        const reviewsResponse = await axiosInstance.get('/api/users/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserReviews(reviewsResponse.data);

        const commentsResponse = await axiosInstance.get('/api/users/comments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserComments(commentsResponse.data);

      } catch (error) {
        console.error('사용자 데이터 가져오기 실패:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.push('/login');
          } else {
            alert('데이터를 불러오는데 실패했습니다.');
          }
        }
      }
    }

    fetchUserData()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      await axiosInstance.put('/users/password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('현재 비밀번호가 올바르지 않습니다.');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header /> {/* 공통 Header 추가 */}
      <h1 className="text-2xl font-bold mb-4">마이 페이지</h1>
      <Tabs defaultValue="profile" onValueChange={setActiveTab}>
        <TabsList className="flex space-x-4">
          <TabsTrigger value="profile" className="text-sm bg-blue-500 text-white px-4 py-2 rounded">프로필</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm bg-green-500 text-white px-4 py-2 rounded">내 리뷰</TabsTrigger>
          <TabsTrigger value="comments" className="text-sm bg-yellow-500 text-white px-4 py-2 rounded">내 댓글</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <form onSubmit={handlePasswordChange} className="space-y-4 text-sm">
            <div>
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="현재 비밀번호를 입력하세요" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="새 비밀번호를 입력하세요" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="새 비밀번호를 다시 입력하세요" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="solid" className="bg-gray-500 hover:bg-gray-600">비밀번호 변경</Button>
          </form>
        </TabsContent>
        <TabsContent value="reviews">
          <ul className="space-y-2 text-sm">
            {userReviews.map((review: Review) => (
              <li key={review.id} className="flex justify-between items-center">
                <Link href={`/review/${review.id}`} className="text-blue-600 hover:underline">
                  {review.title}
                </Link>
                <span className="text-gray-500">{review.date}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="comments">
          <ul className="space-y-2 text-sm">
            {userComments.map((comment: Comment) => (
              <li key={comment.id} className="flex justify-between items-center">
                <span>{comment.content}</span>
                <span className="text-gray-500">{comment.date}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
      <footer className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
        <p>책익는 마을 관리자에게 문의하기: <a href="mailto:rhiyoung@naver.com" className="text-blue-600 hover:underline">rhiyoung@naver.com</a></p>
      </footer>
    </div>
  )
}
