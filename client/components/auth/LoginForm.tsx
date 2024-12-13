import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import SocialLogin from './SocialLogin'
import { UserContext } from '@/context/UserContext'

interface LoginFormProps {
  onClose: () => void
  switchToSignup: () => void
}

export default function LoginForm({ onClose, switchToSignup }: LoginFormProps) {
  const router = useRouter()
  const { setUsername } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`
    } catch (error) {
      console.error('Google 로그인 오류:', error)
      setError('로그인 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <div className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <SocialLogin onGoogleLogin={handleGoogleLogin} isLoading={isLoading} />
        
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
  )
}