import { createContext, useContext, useState, useEffect } from 'react'

interface UserContextType {
  username: string | null
  setUsername: (username: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => {
    // 클라이언트 사이드에서만 실행되도록
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username')
    }
    return null
  })

  useEffect(() => {
    // username이 변경될 때마다 로컬 스토리지 업데이트
    if (username) {
      localStorage.setItem('username', username)
    }
  }, [username])

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}