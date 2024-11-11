import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return;

      try {
        const response = await axiosInstance.post('/auth/verify-email', { token });
        if (response.data.success) {
          // 이메일 인증 성공 시 로컬 스토리지에 상태 저장
          localStorage.setItem('emailVerified', 'true');
          // 회원가입 페이지로 리다이렉트
          router.push('/signup');
        }
      } catch (error) {
        console.error('이메일 인증 실패:', error);
        alert('이메일 인증에 실패했습니다.');
        router.push('/signup');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">이메일 인증 중...</h1>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}