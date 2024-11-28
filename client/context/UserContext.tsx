import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/utils/axios';

interface UserContextType {
  username: string;
  isAdmin: boolean;
  setUsername: (username: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  checkAuthStatus: () => Promise<boolean>;
}

export const UserContext = createContext<UserContextType>({
  username: '',
  isAdmin: false,
  setUsername: () => {},
  setIsAdmin: () => {},
  checkAuthStatus: async () => false
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUsername('');
        setIsAdmin(false);
        return false;
      }

      const response = await axiosInstance.get('/auth/verify', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setUsername(response.data.username || localStorage.getItem('username'));
        setIsAdmin(response.data.isAdmin);
        return true;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUsername('');
        setIsAdmin(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setUsername(storedUsername);
      checkAuthStatus();
    }
  }, []);

  return (
    <UserContext.Provider value={{ 
      username, 
      isAdmin, 
      setUsername, 
      setIsAdmin,
      checkAuthStatus 
    }}>
      {children}
    </UserContext.Provider>
  );
};