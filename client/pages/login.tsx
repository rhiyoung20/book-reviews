import React, { useState } from 'react'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import axios from "axios"
import Link from 'next/link'
import { useRouter } from 'next/router'
import axiosInstance from '../utils/axios'

const Login: React.FC = () => {
  const router = useRouter()
  const { returnUrl } = router.query
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      setUsername(user.username)
      alert(`${user.username}님 환영합니다.`)
      
      // returnUrl이 있으면 해당 페이지로, 없으면 홈으로 이동
      router.push(returnUrl as string || '/')
    } catch (error: any) {
      console.error('로그인 오류:', error)
      alert('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-center mb-8">
        <Link href="/" className="text-3xl font-bold text-green-600">책익는 마을</Link>
      </header>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="이메일을 입력하세요" 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="solid" className="w-full bg-gray-500 hover:bg-gray-600">로그인</Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/signup" className="text-blue-600 hover:underline">
            회원가입
          </Link>
          <span className="mx-2">|</span>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
