import type { AppProps } from 'next/app';
import { UserProvider } from '@/context/UserContext';
import '@/styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
        />
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}

export default MyApp;
