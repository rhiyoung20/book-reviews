import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import SocialLogin from './SocialLogin'
import { useUser } from '@/context/UserContext'
import Image from 'next/image'

interface LoginFormProps {
  onClose: () => void
  switchToSignup: () => void
}

export default function LoginForm({ onClose, switchToSignup }: LoginFormProps) {
  const router = useRouter()
  const { setUsername } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true)
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/kakao`
    } catch (error) {
      console.error('Kakao 로그인 오류:', error)
      setError('로그인 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-[90%] sm:w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        
        <div className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <SocialLogin 
            onGoogleLogin={handleGoogleLogin}
            onKakaoLogin={handleKakaoLogin}
            isLoading={isLoading}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-green-600 hover:text-green-500"
              onClick={switchToSignup}
            >
              계정이 없으신가요? 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}