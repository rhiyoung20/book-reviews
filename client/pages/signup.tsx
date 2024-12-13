import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axios';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react'; // lucide-react 설치 필요

// 상단에 API_URL 상수 추가
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
console.log('Loaded API_URL:', API_URL);  // 환경변수 로드 확인

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);
  const router = useRouter();
  const { social, socialId } = router.query;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 사용자명 변경 시 검증 상태 초기화
    if (name === 'username') {
      setIsUsernameVerified(false);
    }
  };

  const checkUsernameAvailability = async () => {
    const { username } = formData;
    if (!username || username.length < 2 || username.length > 8) {
      setErrors(prev => ({ ...prev, username: '사용자명은 한글 2글자 이상 8글자 이하로 입력해주세요.' }));
      return;
    }

    try {
      const response = await axiosInstance.post('/api/auth/check-username', {
        username
      });

      console.log('사용자명 중복 확인 응답:', response.data); // 디버깅용

      if (response.data.success) {
        if (!response.data.exists) {
          setIsUsernameVerified(true);
          setErrors(prev => ({ ...prev, username: '' }));
          alert('사용 가능한 사용자명입니다.');
        } else {
          setIsUsernameVerified(false);
          setErrors(prev => ({ ...prev, username: '이미 사용 중인 사용자명입니다.' }));
        }
      }
    } catch (error) {
      console.error('사용자명 중복 확인 오류:', error);
      setErrors(prev => ({ ...prev, username: '사용자명 확인 중 오류가 발생했습니다.' }));
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('handleGoogleLogin 함수 호출됨');

    if (!isUsernameVerified) {
      setErrors(prev => ({ ...prev, username: '사용자명(필명) 중복 확인이 필요합니다.' }));
      return;
    }

    try {
      // 세션에 username 저장
      await axiosInstance.post('/api/auth/set-state', {
        state: formData.username
      });

      // username을 쿼리 파라미터로 추가
      const encodedUsername = encodeURIComponent(formData.username);
      const googleAuthUrl = `${API_URL}/api/auth/google?username=${encodedUsername}`;
      console.log('Google 인증 URL:', googleAuthUrl);
      
      // 현재 창에서 이동
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google 로그인 처리 중 오류:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: '로그인 처리 중 오류가 발생했습니다.' 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username) {
      setErrors(prev => ({ ...prev, username: '사용자명(필명)을 입력해 주세요.' }));
      return;
    }

    if (!isUsernameVerified) {
      setErrors(prev => ({ ...prev, username: '사용자명(필명) 중복 확인이 필요합니다.' }));
      return;
    }

    // 소셜 로그인으로 온 경우
    if (social === 'true' && socialId) {
      try {
        // 필명과 소셜 ID로 회원가입 완료
        const response = await axiosInstance.post('/api/auth/complete-social-signup', {
          username: formData.username,
          socialId: socialId
        });

        if (response.data.success) {
          const { token, username } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          router.push('/');
        }
      } catch (error) {
        console.error('소셜 회원가입 완료 오류:', error);
        setErrors(prev => ({ ...prev, submit: '회원가입 처리 중 오류가 발생했습니다.' }));
      }
    } else {
      // 일반 회원가입 처리
      handleGoogleLogin(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  // useEffect 추가 (컴포넌트 최상단)
  useEffect(() => {
    // 소셜 로그인으로 돌아왔을 때 저장된 사용자명 복원
    const pendingUsername = localStorage.getItem('pendingUsername');
    if (social === 'true' && socialId && pendingUsername) {
      setFormData(prev => ({ ...prev, username: pendingUsername }));
      setIsUsernameVerified(true);
      localStorage.removeItem('pendingUsername'); // 사용 후 삭제
    }
  }, [social, socialId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2 group">
          <BookOpen className="h-8 w-8 text-green-600 group-hover:text-green-500" />
          <h2 className="text-3xl font-extrabold text-green-600 group-hover:text-green-500">책익는 마을</h2>
        </Link>
        <p className="mt-2 text-center text-lg text-blue-500">환영합니다</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사용자명 입력 섹션 */}
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
                  className={`flex-1 min-w-0 block w-full px-3 py-3 rounded-l-md border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-green-500 focus:border-green-500`}
                  placeholder="예: 책벌레"
                />
                <button
                  type="button"
                  onClick={checkUsernameAvailability}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  중복확인
                </button>
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* 소셜 로그인 섹션 */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">간편 회원 가입</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors"
              >
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  className="w-6 h-6 mr-2"
                />
                <span className="text-gray-700 font-medium">Google로 계속하기</span>
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-yellow-300 hover:bg-yellow-400 transition-colors">
                <img
                  src="/kakao-icon.svg"
                  alt="Kakao"
                  className="w-6 h-6 mr-2"
                />
                <span className="text-gray-900 font-medium">카카오로 계속하기</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                로그인하기
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}