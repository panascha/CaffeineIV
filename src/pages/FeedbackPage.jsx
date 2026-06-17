import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { gasPost } from '../services/gas.service.js'
import { normalizePhone } from '../utils/phoneNorm.js'

export default function FeedbackPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) { setError('Write a message first'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await gasPost('submitFeedback', {
        message: message.trim(),
        phone: phone.trim() ? normalizePhone(phone.trim()) : '',
      })
      if (res.status === 'success') {
        setDone(true)
      } else {
        setError('Failed to send. Try again.')
      }
    } catch {
      setError('Connection error. Try again.')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
          <ChevronLeft size={22} color="#2C1A0E" />
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Feedback</h1>
      </div>

      <div style={{ padding: '1.5rem 1rem' }}>
        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '3rem', textAlign: 'center' }}>
            <CheckCircle size={48} color="#2E7D32" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#2C1A0E' }}>Thanks for your feedback!</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>It helps improve the service.</p>
            <button onClick={() => navigate('/')} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}>
              Back to Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>Anonymous feedback. Leave your phone if you'd like a reply.</p>

            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Message</p>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Your feedback, suggestions, or complaints…"
                rows={5}
                maxLength={500}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '12px 14px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Phone (optional)</p>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="081-234-5678"
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '12px 14px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
              />
            </div>

            {error && <p style={{ margin: 0, fontSize: '13px', color: '#C0392B' }}>{error}</p>}

            <button type="submit" disabled={submitting} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '16px', fontSize: '15px', fontWeight: 600, cursor: submitting ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Sending…' : 'Send Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
