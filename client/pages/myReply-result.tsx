'use client'

import { useState, useEffect } from 'react'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import Link from 'next/link'
import axiosInstance from '../utils/axios'
import Header from '../components/Header'
import router, { useRouter } from 'next/router'
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('@radix-ui/react-select').then(mod => mod.Root), {
  ssr: false
});

const SelectTrigger = dynamic(() => import('@radix-ui/react-select').then(mod => mod.Trigger), {
  ssr: false
});

const SelectValue = dynamic(() => import('@radix-ui/react-select').then(mod => mod.Value), {
  ssr: false
});

const SelectContent = dynamic(() => import('@radix-ui/react-select').then(mod => mod.Content), {
  ssr: false
});

const SelectItem = dynamic(() => import('@radix-ui/react-select').then(mod => mod.Item), {
  ssr: false
});

interface Comment {
  id: number;
  content: string;
  reviewId: number;
  reviewTitle: string;
  createdAt: string;
}

export default function ReplyResultPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [comments, setComments] = useState<Comment[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const fetchComments = async (page: number, sort: string, search?: string) => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(`/users/comments`, {
        params: {
          page,
          sort,
          search
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setComments(response.data.comments)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('댓글 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments(currentPage, sortBy)
  }, [currentPage, sortBy])

  const handleSearch = () => {
    fetchComments(1, sortBy, searchTerm)
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    fetchComments(1, value, searchTerm)
  }

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      await axiosInstance.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      alert('댓글이 삭제되었습니다.')
      fetchComments(currentPage, sortBy, searchTerm)
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-2xl font-bold mb-6">내 댓글</h1>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <Label htmlFor="search" className="mr-2"></Label>
          <Input 
            id="search" 
            placeholder="댓글 내용 검색" 
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="solid" onClick={handleSearch} className="ml-2">검색</Button>
        </div>
        <div className="flex items-center">
          <Label htmlFor="sort" className="mr-2"></Label>
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger id="sort" className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
              <SelectItem value="most-viewed">조회수 높은순</SelectItem>
            </SelectContent>
          </Select>
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
                <td className="px-6 py-4 text-sm text-gray-900">{comment.content}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                  <Link href={`/${comment.reviewId}`}>{comment.reviewTitle}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/${comment.reviewId}?editComment=${comment.id}`)}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-4 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <Button
            variant="outline"
            onClick={() => fetchComments(currentPage - 1, sortBy, searchTerm)}
            disabled={currentPage === 1}
            className="text-sm"
          >
            이전
          </Button>
          <span className="px-4 py-2 bg-white text-gray-700 text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchComments(currentPage + 1, sortBy, searchTerm)}
            disabled={currentPage === totalPages}
            className="text-sm"
          >
            다음
          </Button>
        </nav>
      </div>
    </div>
  )
}