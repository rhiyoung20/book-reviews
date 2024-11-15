import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // 현재 페이지 URL을 returnUrl로 저장
      const currentPath = window.location.pathname;
      window.location.href = `/login?returnUrl=${currentPath}`;
      
      // 사용자에게 메시지 표시
      if (errorCode === 'TOKEN_EXPIRED') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert('인증에 실패했습니다. 다시 로그인해주세요.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;