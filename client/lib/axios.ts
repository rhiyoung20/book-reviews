import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
})

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use((config) => {
  // 서버사이드에서는 localStorage 접근 불가
  if (typeof window !== 'undefined') {  // 브라우저 환경인지 체크
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance