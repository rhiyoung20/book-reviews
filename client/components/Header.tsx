import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './ui/Button';
import { UserContext } from '@/context/UserContext';
import axiosInstance from '../utils/axios';

interface HeaderProps {
  hideAuthButtons?: boolean;
}

const Header = ({ hideAuthButtons = false }: HeaderProps) => {
  const router = useRouter();
  const { username, setUsername } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (storedUsername && token) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [setUsername]); // username이 변경될 때마다 실행

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    router.push('/');
  };

  return (
    <header className="mt-2">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            책익는 마을
          </Link>
          
          {!hideAuthButtons && (
            <div className="flex items-center space-x-4">
              {isLoggedIn && username ? (
                <>
                  <span className="text-gray-600">{username}님 환영합니다</span>
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
                  <Link href="/login">
                    <Button variant="outline">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline">회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
