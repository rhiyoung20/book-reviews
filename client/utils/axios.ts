import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      const returnUrl = window.location.pathname
      window.location.href = `/login?returnUrl=${returnUrl}`
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance