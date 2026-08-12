'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="button primary" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction] = useActionState(loginAction, undefined as { error?: string } | undefined)

  return (
    <form action={formAction} className="card" style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h1 style={{ marginTop: 0, fontSize: '1.1rem' }}>Icons Admin</h1>

      {from && <input type="hidden" name="from" value={from} />}

      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" autoComplete="username" required />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state?.error && <p className="error">{state.error}</p>}

      <SubmitButton />
    </form>
  )
}
