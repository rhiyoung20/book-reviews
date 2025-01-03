import { FcGoogle } from 'react-icons/fc'
import { RiKakaoTalkFill } from 'react-icons/ri'

interface SocialLoginProps {
  onGoogleLogin: () => void
  onKakaoLogin: () => void
  isLoading: boolean
  mode?: 'login' | 'signup'
}

export default function SocialLogin({ onGoogleLogin, onKakaoLogin, isLoading, mode = 'login' }: SocialLoginProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <FcGoogle className="h-5 w-5" />
        {isLoading ? '처리 중...' : `Google로 ${mode === 'signup' ? '회원가입' : '로그인'}`}
      </button>

      <button
        type="button"
        onClick={onKakaoLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-yellow-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50"
      >
        <RiKakaoTalkFill className="h-5 w-5" />
        {isLoading ? '처리 중...' : `카카오로 ${mode === 'signup' ? '회원가입' : '로그인'}`}
      </button>
    </div>
  )
}