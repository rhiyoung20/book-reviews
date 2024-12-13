import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './ui/Button';
import { UserContext } from '@/context/UserContext';
import AuthModal from './auth/AuthModal';

interface HeaderProps {
  hideAuthButtons?: boolean;
}

const Header = ({ hideAuthButtons = false }: HeaderProps) => {
  const router = useRouter();
  const { username, setUsername } = useContext(UserContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    router.push('/');
  };

  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  return (
    <>
      <header className="mt-2">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              책익는 마을
            </Link>
            
            {!hideAuthButtons && (
              <div className="flex items-center space-x-4">
                {username ? (
                  <>
                    <span className="text-gray-600">{username}</span>
                    <Link href="/mypage">
                      <Button variant="outline">마이 페이지</Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                    >
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={openLoginModal}
                    >
                      로그인
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={openSignupModal}
                    >
                      회원가입
                    </Button>
                  </>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        switchMode={switchAuthMode}
      />
    </>
  );
};

export default Header;