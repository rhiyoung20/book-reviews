import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';

export default function LoginPage() {
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    if (error === 'callback_failed') {
      // 에러 처리 후 홈으로 리다이렉트
      router.push('/');
    }
  }, [error, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          {error === 'callback_failed' && (
            <p className="mt-2 text-red-600">
              로그인에 실패했습니다. 다시 시도해주세요.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}