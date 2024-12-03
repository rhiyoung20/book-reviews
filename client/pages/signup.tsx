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
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameVerified, setIsUsernameVerified] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('')
  const [passwordError, setPasswordError] = useState<string>('')

  // 초기 상태값 설정
  const initialFormState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  };

  // 모든 useEffect를 하나로 통합
  useEffect(() => {
    const { token, email, verified } = router.query;
    
    // 저장된 데이터 복원
    const savedData = localStorage.getItem('signupFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        ...parsedData
      }));
      
      // 인증 상태도 복원
      if (parsedData.isUsernameVerified) {
        setIsUsernameVerified(true);
      }
      if (parsedData.isEmailVerified) {
        setIsEmailVerified(true);
      }
    }

    // 이메일 인증 처리
    if (verified === 'true' && email && token) {
      console.log('이메일 인증 처리 시작'); // 디버깅
      verifyEmailToken(token);
    }
  }, [router.query]);

  // 이메일 인증 토큰 검증 함수 수정
  const verifyEmailToken = async (token: string | string[]) => {
    const tokenValue = Array.isArray(token) ? token[0] : token;
    
    try {
      const response = await axiosInstance.post('/api/auth/verify-email', { token: tokenValue });
      
      if (response.data.success) {
        // 상태 업데이트
        setFormData(prev => ({
          ...prev,
          email: response.data.email
        }));
        setIsEmailVerified(true);
        
        // 로컬 스토리지 업데이트
        const updatedData = {
          ...formData,
          email: response.data.email,
          isEmailVerified: true
        };
        localStorage.setItem('signupFormData', JSON.stringify(updatedData));
        
        // 성공 메시지 표시
        alert('이메일 인증이 완료되었습니다.');
        
        // 부모 창에 메시지 전달 및 창 닫기
        if (window.opener) {
          window.opener.postMessage({ type: 'EMAIL_VERIFIED', email: response.data.email }, '*');
          window.close();
        }
      }
    } catch (error) {
      console.error('이메일 인증 실패:', error);
      alert('이메일 인증에 실패했습니다.');
    }
  };

  // 데이터 변경 시 자동 저장
  useEffect(() => {
    if (formData.username || formData.email || formData.phone) {
      const dataToSave = {
        ...formData,
        isUsernameVerified,
        isEmailVerified
      };
      localStorage.setItem('signupFormData', JSON.stringify(dataToSave));
    }
  }, [formData, isUsernameVerified, isEmailVerified]);

  // handleEmailVerification 함수는 제거 (verifyEmailToken으로 통합)

  // 사용자명 중복 체크 - 타임아웃 추가
  const checkUsername = async () => {
    try {
      setIsCheckingUsername(true);  // 로딩 상태 시작
      console.log('Checking username:', formData.username); // 디버깅용

      const response = await axiosInstance.post('/api/auth/check-username', {
        username: formData.username
      });
      
      console.log('Server response:', response.data); // 디버깅용
      
      if (response.data.success) {
        if (response.data.exists) {
          alert('이미 사용 중인 사용자명입니다.');
          setIsUsernameVerified(false);
        } else {
          alert('사용 가능한 사용자명입니다.');
          setIsUsernameVerified(true);
        }
      }
    } catch (error: any) {
      console.error('Username check error:', error);
      alert('사용자명 확인 중 오류가 발생했습니다.');
      setIsUsernameVerified(false);
    } finally {
      setIsCheckingUsername(false);  // 로딩 상태 종료
    }
  };

  // 이메일 인증 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'EMAIL_VERIFIED') {
        setIsEmailVerified(true);
        setFormData(prev => ({
          ...prev,
          email: event.data.email
        }));
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

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      confirmPassword: confirmValue
    }));
    
    if (formData.password !== confirmValue) {
      setPasswordError('입력한 비밀번호와 다릅니다.');
    } else {
      setPasswordError('');
    }
  };

  // saveFormData 유틸리티 함수 추가
  const saveFormData = (data: any) => {
    localStorage.setItem('signupFormData', JSON.stringify(data));
  };

  // 새로운 이메일 인증 요청 함수 추가
  const requestEmailVerification = async () => {
    if (isEmailSending) return;  // 이미 처리 중이면 중복 요청 방지

    try {
      setIsEmailSending(true);
      console.log('Sending verification email to:', formData.email); // 디버깅용

      const response = await axiosInstance.post('/api/auth/send-verification', {
        email: formData.email
      });
      
      if (response.data.success) {
        alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
        setIsEmailSent(true);
      }
    } catch (error: any) {
      console.error('이메일 발송 오류:', error);
      alert(error.response?.data?.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsEmailSending(false);
    }
  };

  // handleSubmit 함수 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 시도', { formData, isEmailVerified, isUsernameVerified }); // 디버깅
    
    // 유효성 검사
    const validationErrors: {[key: string]: string} = {};
    
    if (!isUsernameVerified) {
      validationErrors.username = '사용자명 중복 확인이 필요합니다.';
    }
    if (!isEmailVerified) {
      validationErrors.email = '이메일 인증이 필요합니다.';
    }
    if (!formData.password || formData.password !== formData.confirmPassword) {
      validationErrors.password = '비밀번호가 일치하지 않습니다.';
    }
    if (!formData.phone) {
      validationErrors.phone = '전화번호를 입력해주세요.';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('유효성 검사 실패:', validationErrors); // 디버깅
      return;
    }

    try {
      setIsLoading(true);
      console.log('서버로 회원가입 요청 전송'); // 디버깅

      const response = await axiosInstance.post('/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      console.log('서버 응답:', response.data); // 디버깅

      if (response.data.success) {
        localStorage.removeItem('signupFormData');
        alert(`환영합니다, ${formData.username}님!`);
        router.push('/login');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      alert(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 이동 시 데이터 클리어
  useEffect(() => {
    return () => {
      localStorage.removeItem('signupFormData');
    };
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isCheckingUsername || isUsernameVerified}
                className={`w-32 ${
                  isUsernameVerified 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isUsernameVerified 
                  ? '확인 완료' 
                  : isCheckingUsername 
                    ? '확인 중...' 
                    : '중복 확인'}
              </Button>
            </div>
            <div className="mt-4 mb-2 text-sm text-gray-600">              
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
                onClick={requestEmailVerification}
                disabled={isEmailSending || isEmailVerified || !formData.email}
                className={`w-full ${
                  isEmailVerified 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isEmailVerified 
                  ? '인증 완료' 
                  : isEmailSending 
                    ? '처리 중...' 
                    : '이메일로 인증하기'}
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
              onChange={handleConfirmPasswordChange}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
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