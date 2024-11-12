import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Link from 'next/link'
import { useRouter } from 'next/router'
import axiosInstance from '@/utils/axios'
import Header from '@/components/Header'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameVerified, setIsUsernameVerified] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('')

  // 사용자명 중복 체크 - 타임아웃 추가
  const checkUsername = async () => {
    try {
      console.log('Checking username:', formData.username); // 디버깅용
      const response = await axiosInstance.post('/auth/check-username', {
        username: formData.username
      });
      console.log('Server response:', response.data); // 디버깅용
      
      alert(response.data.message);
      setIsUsernameVerified(response.data.available);
    } catch (error: any) {
      console.error('Username check error:', error); // 디버깅용
      console.error('Error response:', error.response); // 디버깅용
      alert(error.response?.data?.message || '사용자명 확인 중 오류가 발생했습니다.');
      setIsUsernameVerified(false);
    }
  };

  // 이메일 인증 메일 발송
  const handleEmailVerification = async () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsEmailSending(true);
      const response = await axiosInstance.post('/auth/send-verification', {
        email: formData.email
      });
      
      alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      
      // 이메일 발송 후 상태 업데이트
      setIsEmailSent(true);
    } catch (error: any) {
      console.error('Email verification error:', error);
      alert(error.response?.data?.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsEmailSending(false);
    }
  };

  // 이메일 인증 확인
  const verifyEmailToken = async (token: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        setIsEmailVerified(true);
        setEmailVerificationMessage('이메일이 성공적으로 인증되었습니다.');
        setTimeout(() => setEmailVerificationMessage(''), 3000); // 3초 후 메시지 제거
      }
    } catch (error: any) {
      setEmailVerificationMessage(error.response?.data?.message || '이메일 인증에 실패했습니다.');
      setIsEmailVerified(false);
    }
  };

  // useEffect로 URL 파라미터 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    if (email) {
      setFormData(prev => ({
        ...prev,
        email: email
      }));
    }
    
    if (token) {
      verifyEmailToken(token);
      // URL에서 토큰 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // 페이지 로드 시 저장된 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('signupData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        ...parsedData
      }));
      if (parsedData.isUsernameVerified) {
        setIsUsernameVerified(true);
      }
    }
  }, []);

  // 데이터 변경 시 저장
  useEffect(() => {
    localStorage.setItem('signupData', JSON.stringify({
      ...formData,
      isUsernameVerified
    }));
  }, [formData, isUsernameVerified]);

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 클라이언트 측 유효성 검사 강화
      if (!isEmailVerified) {
        setErrors(prev => ({ ...prev, email: '이메일 인증이 필요합니다.' }));
        return;
      }
      
      const response = await axiosInstance.post('/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      if (response.data.success) {
        router.push('/login?registered=true');
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, signup: '회원가입 중 오류가 발생했습니다.' }));
    }
  };

  // 이메일 인증 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === process.env.NEXT_PUBLIC_API_URL) {
        if (event.data.type === 'EMAIL_VERIFIED') {
          setIsEmailVerified(true);
          setEmailVerificationMessage('이메일이 성공적으로 인증되었습니다.');
          setTimeout(() => setEmailVerificationMessage(''), 3000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // useEffect 추가
  useEffect(() => {
    // 로컬 스토리지에서 이메일 인증 상태 확인
    const emailVerified = localStorage.getItem('emailVerified');
    if (emailVerified === 'true') {
      setIsEmailVerified(true);
      // 상태 확인 후 로컬 스토리지 클리어
      localStorage.removeItem('emailVerified');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Header hideAuthButtons={true} />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600 leading-relaxed">
            '책익는 마을'은 여러분이 책을 읽으면서 느꼈던 경험을 공유하는 공간입니다. 회원 가입이 필수는 아니지만 로그인해야 글을 쓸 수 있습니다. 
            이 공간에서 다른 사람에게 불편함을 끼치는 글 또는 댓글은 관리자가 삭제할 수 있다는 점 양해 바랍니다.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <Label htmlFor="username">사용자명 (한글)</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    username: e.target.value
                  }))
                  setIsUsernameVerified(false)
                }}
                required
              />
              <Button
                type="button"
                variant="solid"
                onClick={checkUsername}
                disabled={isCheckingUsername}
                className="w-32"
              >
                {isCheckingUsername ? '확인 중...' : '중복 확인'}
              </Button>
            </div>
            <div className="mt-4 mb-2 text-sm text-gray-600">
              * 이메일 인증 방법:
              <ol className="list-decimal ml-5 mt-1">
                <li>이메일 주소 입력 후 '인증코드 받기' 클릭</li>
                <li>테스트용 인증 코드: 123456</li>
                <li>인증 코드 입력 후 '확인' 클릭</li>
              </ol>
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">이메일</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                disabled={isEmailVerified}
                required
              />
              <Button
                type="button"
                variant="solid"
                onClick={handleEmailVerification}
                disabled={isEmailSending || isEmailVerified}
                className={`px-4 py-2 text-white font-bold rounded ${
                  isEmailVerified 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : isEmailSending 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-700'
                }`}
              >
                {isEmailVerified 
                  ? '인증완료' 
                  : isEmailSending 
                    ? '발송중...' 
                    : '이메일 인증하기'}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                phone: e.target.value
              }))}
              placeholder="예: 010-1234-5678"
              required
            />
          </div>

          <Button
            type="submit"
            variant="solid"
            className="w-full"
            disabled={isLoading || !isEmailVerified}
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </div>
    </div>
  )
}