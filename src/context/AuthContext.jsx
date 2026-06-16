import { createContext, useContext, useState } from 'react'
import { adminLogout, getAdminSession } from '../services/auth.service.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAdminSession())

  function login(sessionData) {
    localStorage.setItem('admin_session', JSON.stringify(sessionData))
    setSession(sessionData)
  }

  function logout() {
    adminLogout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
