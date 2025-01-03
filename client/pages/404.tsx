import React from 'react';
import Header from '@/components/Header';

export default function Custom404() {
  return (
    <div className="container mx-auto px-4">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">페이지를 찾을 수 없습니다</p>
      </div>
    </div>
  );
}
