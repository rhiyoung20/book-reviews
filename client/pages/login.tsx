import React, { useContext } from 'react'
import { Button } from "../components/ui/Button"
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UserContext } from '../context/UserContext'

const Login: React.FC = () => {
  const router = useRouter()
  const { returnUrl } = router.query
  const { setUsername: setContextUsername } = useContext(UserContext)

  // 소셜 로그인 성공 후 처리
  const handleSocialLoginSuccess = (user: any) => {
    localStorage.setItem('token', user.token)
    localStorage.setItem('username', user.username)
    setContextUsername(user.username)
    alert(`${user.username}님 환영합니다.`)
    router.push(returnUrl as string || '/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-center mb-8">
        <Link href="/" className="text-3xl font-bold text-green-600">책익는 마을</Link>
      </header>

      <div className="max-w-md mx-auto">
        <div className="space-y-4">
          <Button 
            variant="solid"
            onClick={() => {/* 구글 로그인 로직 */}} 
            className="w-full bg-white text-gray-700 border border-gray-300"
          >
            구글로 로그인
          </Button>
          <Button 
            variant="solid"
            onClick={() => {/* 카카오 로그인 로직 */}} 
            className="w-full bg-yellow-300 text-gray-900"
          >
            카카오로 로그인
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Login
