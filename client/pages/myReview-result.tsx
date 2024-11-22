'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Link from 'next/link'
import axiosInstance from '@/utils/axios'
import Header from '@/components/Header'
import dynamic from 'next/dynamic'

const Select = dynamic(() => import('@/components/ui/Select').then(mod => mod.Select), {
  ssr: false
})
const SelectContent = dynamic(() => import('@/components/ui/Select').then(mod => mod.SelectContent), {
  ssr: false
})
const SelectItem = dynamic(() => import('@/components/ui/Select').then(mod => mod.SelectItem), {
  ssr: false
})
const SelectTrigger = dynamic(() => import('@/components/ui/Select').then(mod => mod.SelectTrigger), {
  ssr: false
})
const SelectValue = dynamic(() => import('@/components/ui/Select').then(mod => mod.SelectValue), {
  ssr: false
})

interface Review {
  id: number;
  title: string;
  bookTitle: string;
  date: string;
  views: number;
}

export default function ReviewsResultPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchReviews(currentPage, sortBy)
  }, []) // 컴포넌트 마운트 시 데이터 로드

  const fetchReviews = async (page: number, sort: string, search?: string) => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(`/users/reviews`, {
        params: {
          page,
          sort,
          search
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setReviews(response.data.reviews)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchReviews(1, sortBy, searchTerm)
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    fetchReviews(currentPage, value, searchTerm)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Header />
      <h1 className="text-2xl font-bold mb-6">내 리뷰</h1>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <Label htmlFor="search" className="mr-2"></Label>
          <Input 
            id="search" 
            placeholder="리뷰 제목 검색" 
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="solid" onClick={handleSearch} className="ml-2">검색</Button>
        </div>
        <div className="flex items-center">
          <Label htmlFor="sort" className="mr-2"></Label>
          {!isLoading && (
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
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">책 제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                  <Link href={`/${review.id}`}>{review.title}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.bookTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <Button
            variant="outline"
            onClick={() => fetchReviews(currentPage - 1, sortBy, searchTerm)}
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
            onClick={() => fetchReviews(currentPage + 1, sortBy, searchTerm)}
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