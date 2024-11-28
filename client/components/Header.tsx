import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './ui/Button';
import { UserContext } from '@/context/UserContext';
import axios from 'axios';

interface HeaderProps {
  hideAuthButtons?: boolean;
}

const Header = ({ hideAuthButtons = false }: HeaderProps) => {
  const router = useRouter();
  const { username, setUsername, checkAuthStatus } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      setUsername(storedUsername);
    }
  }, [setUsername]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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
              {username ? (
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
