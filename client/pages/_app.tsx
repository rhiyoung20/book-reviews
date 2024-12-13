import type { AppProps } from 'next/app';
import { UserProvider } from '@/context/UserContext';
import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const status = params.get('status');

    if (token && username && status === 'success') {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      router.push('/');
    }
  }, []);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
