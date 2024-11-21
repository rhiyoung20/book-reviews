import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  username: string;
  isAdmin: boolean;
  setUsername: (username: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const UserContext = createContext<UserContextType>({
  username: '',
  isAdmin: false,
  setUsername: () => {},
  setIsAdmin: () => {}
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    if (storedUsername) {
      setUsername(storedUsername);
      setIsAdmin(storedIsAdmin);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username, isAdmin, setUsername, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
};