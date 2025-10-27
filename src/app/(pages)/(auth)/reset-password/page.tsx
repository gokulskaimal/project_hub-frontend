'use client'
import React, { useState } from 'react'
import { api } from '../../../../utils/api'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const request = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/reset-password-request', { email })
      setMessage('Reset link/token sent (check server response).')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const reset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setMessage('Password reset successful')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-md">
      <h1 className="text-xl font-semibold">Password Reset</h1>
      {message && <div className="text-green-700 text-sm">{message}</div>}
      {error && <div className="text-red-700 text-sm">{error}</div>}

      <form onSubmit={request} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm">Email</label>
          <input id="email" className="border px-3 py-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 text-sm" type="submit">Request Reset</button>
      </form>

      <form onSubmit={reset} className="space-y-3">
        <div>
          <label htmlFor="token" className="block text-sm">Token</label>
          <input id="token" className="border px-3 py-2 w-full" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm">New Password</label>
          <input id="new-password" type="password" className="border px-3 py-2 w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 text-sm" type="submit">Reset Password</button>
      </form>
    </div>
  )
}


