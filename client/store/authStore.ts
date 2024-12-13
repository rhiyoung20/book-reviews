import { create } from 'zustand'

type AuthStore = {
  isOpen: boolean
  mode: 'login' | 'signup'
  setIsOpen: (isOpen: boolean) => void
  setMode: (mode: 'login' | 'signup') => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  mode: 'login',
  setIsOpen: (isOpen) => set(() => ({ isOpen })),
  setMode: (mode) => set(() => ({ mode }))
}))
