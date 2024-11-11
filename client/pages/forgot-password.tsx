import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Link from 'next/link'
import axiosInstance from '@/utils/axios'
import Header from '@/components/Header'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setTempPassword('')

    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email })
      setTempPassword(response.data.tempPassword)
      setMessage('임시 비밀번호가 이메일로 발송되었습니다. 이 비밀번호로 로그인한 후 새 비밀번호를 설정해주세요.')
    } catch (error) {
      setMessage('비밀번호 재설정 요청 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-md mx-auto">
        <header className="flex justify-center mb-8">
          <Link href="/" className="text-3xl font-bold text-green-600">
            책익는 마을
          </Link>
        </header>
        <h1 className="text-2xl font-bold mb-6">비밀번호 찾기</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="가입시 사용한 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button variant="solid"
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '임시 비밀번호 받기'}
          </Button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${message.includes('오류') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
        {tempPassword && (
          <p className="mt-4 text-sm font-bold">임시 비밀번호: {tempPassword}</p>
        )}
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}