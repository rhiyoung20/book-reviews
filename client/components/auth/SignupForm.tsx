import { useState } from 'react'
import { useRouter } from 'next/router'
import SocialLogin from './SocialLogin'
import { axiosInstance } from '@/lib/axios'

interface SignupFormProps {
  onClose: () => void
  switchToLogin: () => void
}

export default function SignupForm({ onClose, switchToLogin }: SignupFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isUsernameVerified, setIsUsernameVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsUsernameVerified(false)
  }

  const handleUsernameCheck = async () => {
    const { username } = formData
    console.log('중복확인 요청:', username)

    if (!username || username.length < 2 || username.length > 8) {
      setErrors(prev => ({ 
        ...prev, 
        username: '사용자명은 한글 2글자 이상 8글자 이하로 입력해주세요.' 
      }))
      return
    }

    try {
      const response = await axiosInstance.post('/auth/check-username', {
        username
      })

      if (response.data.success) {
        if (!response.data.exists) {
          setIsUsernameVerified(true)
          setErrors(prev => ({ ...prev, username: '' }))
          alert('사용 가능한 사용자명입니다.')
        } else {
          setIsUsernameVerified(false)
          setErrors(prev => ({ ...prev, username: '이미 사용 중인 사용자명입니다.' }))
        }
      }
    } catch (error) {
      console.error('사용자명 중복 확인 오류:', error)
      setErrors(prev => ({ 
        ...prev, 
        username: '사용자명 확인 중 오류가 발생했습니다.' 
      }))
    }
  }

  const handleGoogleSignup = async () => {
    try {
      if (!formData.username || !isUsernameVerified) {
        alert('사용자명을 확인해주세요.');
        return;
      }

      setIsLoading(true);
      
      // prepare-signup 호출
      const response = await axiosInstance.post('/auth/prepare-signup', 
        { username: formData.username },
        { withCredentials: true }
      );

      if (response.data.success) {
        // 직접 리다이렉트
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/signup`;
      } else {
        throw new Error('사용자명 저장 실패');
      }
    } catch (error) {
      console.error('Google 회원가입 오류:', error);
      alert('회원가입 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleKakaoSignup = async () => {
    try {
      if (!formData.username || !isUsernameVerified) {
        alert('사용자명을 확인해주세요.');
        return;
      }

      setIsLoading(true);
      
      // 환경변수 값 확인을 위한 로그 추가
      console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await axiosInstance.post('/auth/prepare-signup', 
        { username: formData.username },
        { withCredentials: true }
      );

      if (response.data.success) {
        const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao/signup`;
        console.log('Redirect URL:', redirectUrl);  // 최종 URL 확인
        window.location.href = redirectUrl;
      } else {
        throw new Error('사용자명 저장 실패');
      }
    } catch (error) {
      console.error('Kakao 회원가입 오류:', error);
      alert('회원가입 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-[90%] sm:w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

        <form className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              필명 (한글 2~8글자)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              리뷰 또는 댓글 작성시 사용될 필명입니다.
            </p>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } focus:ring-green-500 focus:border-green-500`}
                placeholder="예: 책벌레"
              />
              <button
                type="button"
                onClick={handleUsernameCheck}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                중복확인
              </button>
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <SocialLogin 
            onGoogleLogin={handleGoogleSignup}
            onKakaoLogin={handleKakaoSignup}
            isLoading={isLoading}            
            mode="signup"
          />

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-green-600 hover:text-green-500"
              onClick={switchToLogin}
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}