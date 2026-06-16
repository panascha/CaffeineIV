import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/auth.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminLogin(username, password)
      if (res.status === 'success') {
        login(res.data)
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Invalid username or password')
      }
    } catch {
      setError('Connection error — check your network')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '360px', boxShadow: 'var(--shadow-card)' }}>
        <img src="/icon.jpg" alt="Caffeine._.iv" style={{ width: '64px', borderRadius: '12px', marginBottom: '1.5rem', display: 'block' }} />
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.25rem' }}>Admin Login</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 1.5rem' }}>Caffeine._.iv management</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>Username</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{ height: '48px', border: '1px solid var(--color-border)', borderRadius: '0.875rem', padding: '0 0.875rem', fontSize: '15px', background: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ height: '48px', border: '1px solid var(--color-border)', borderRadius: '0.875rem', padding: '0 0.875rem', fontSize: '15px', background: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none' }}
            />
          </label>

          {error && (
            <p style={{ fontSize: '13px', color: 'var(--color-destructive)', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px',
              background: loading ? 'var(--color-surface-muted)' : 'var(--color-primary)',
              color: loading ? 'var(--color-text-muted)' : '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : 'var(--shadow-button)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
