import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

export default function Header() {
  const { username, setUsername } = useUser();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    router.push('/');
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  return (
    <>
      <header className="bg-white shadow mt-8">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/">
            <span className="text-3xl font-bold text-green-700">책익는 마을</span>
          </Link>
          <div className="flex items-center gap-4">
            {username ? (
              <>
                <span className="text-sm text-gray-600">{username}님</span>
                <Link href="/mypage">
                  <span className="text-sm text-blue-600">마이페이지</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  로그인
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {showLoginModal && (
        <LoginForm
          onClose={() => setShowLoginModal(false)}
          switchToSignup={switchToSignup}
        />
      )}
      {showSignupModal && (
        <SignupForm
          onClose={() => setShowSignupModal(false)}
          switchToLogin={switchToLogin}
        />
      )}
    </>
  );
}