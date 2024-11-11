import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './ui/Button';
import { UserContext } from '@/context/UserContext';
import axiosInstance from '../utils/axiosInstance';

interface HeaderProps {
  hideAuthButtons?: boolean;  // 로그인/회원가입 버튼 숨김 여부
}

const Header = ({ hideAuthButtons = false }: HeaderProps) => {
  const router = useRouter();
  const { username, setUsername } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 상태 체크
    const checkLoginStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/check');
        setIsLoggedIn(response.data.isLoggedIn);
        setUsername(response.data.username || '');
      } catch (err) {
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 토큰과 사용자 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // UserContext 상태 초기화
    setUsername('');
    
    // 홈페이지로 리다이렉트
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
              {isLoggedIn ? (
                <>
                  <Link href="/mypage">
                    <span className="text-gray-600 hover:text-gray-900">
                      {username}님
                    </span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
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
