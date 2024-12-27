import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useUserContext } from '@/context/UserContext';

export default function AuthSuccess() {
  const router = useRouter();
  const { token, username } = router.query;
  const { login } = useUserContext();

  useEffect(() => {
    if (token && username) {
      login(token as string, username as string);
      alert(`${username}님 환영합니다.`);
      router.push('/');
    }
  }, [token, username, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mt-2 text-gray-600">로그인 처리중...</p>
      </div>
    </div>
  );
}