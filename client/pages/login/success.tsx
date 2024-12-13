import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '@/context/UserContext';

export default function AuthSuccess() {
  const router = useRouter();
  const { token, username, needsUsername } = router.query;
  const { setUsername: setContextUsername } = useContext(UserContext);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token as string);
      
      if (needsUsername === 'true') {
        router.push('/signup?social=true');
      } else {
        if (username && username !== 'undefined') {
          localStorage.setItem('username', username as string);
          setContextUsername(username as string);
        }
        router.push('/');
      }
    }
  }, [token, username, needsUsername, router, setContextUsername]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">로그인 성공!</h2>
        <p className="mt-2 text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
}