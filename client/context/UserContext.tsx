import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
}

export const UserContext = createContext<UserContextType>({
  username: '',
  setUsername: () => {}
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 사용자 정보 복원
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};