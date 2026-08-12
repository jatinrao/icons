'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

export interface IconFormValues {
  name: string
  label: string
  svg: string
  tags: string
  category: string
}

interface IconFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | undefined>
  initialValues?: IconFormValues
  submitLabel: string
}

const emptyValues: IconFormValues = { name: '', label: '', svg: '', tags: '', category: '' }

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="button primary" disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  )
}

export function IconForm({ action, initialValues = emptyValues, submitLabel }: IconFormProps) {
  const [state, formAction] = useActionState(action, undefined as { error?: string } | undefined)
  const [svg, setSvg] = useState(initialValues.svg)

  return (
    <form action={formAction} className="card" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
      <div>
        <div className="field">
          <label htmlFor="name">Name (registry key)</label>
          <input id="name" name="name" defaultValue={initialValues.name} placeholder="my-icon" required />
        </div>

        <div className="field">
          <label htmlFor="label">Label</label>
          <input id="label" name="label" defaultValue={initialValues.label} placeholder="My Icon" required />
        </div>

        <div className="field">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input id="tags" name="tags" defaultValue={initialValues.tags} placeholder="framework, frontend" />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" defaultValue={initialValues.category} placeholder="plain" />
        </div>

        <div className="field">
          <label htmlFor="svg">SVG markup</label>
          <textarea
            id="svg"
            name="svg"
            defaultValue={initialValues.svg}
            placeholder="<svg viewBox=&quot;0 0 24 24&quot;>...</svg>"
            required
            onChange={(event) => setSvg(event.currentTarget.value)}
          />
        </div>

        {state?.error && <p className="error">{state.error}</p>}

        <SubmitButton label={submitLabel} />
      </div>

      <div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 0 }}>Preview</p>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            background: '#fff',
          }}
        >
          {svg.includes('<svg') ? (
            <div style={{ width: 96, height: 96 }} dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <span style={{ color: '#999', fontSize: '0.85rem' }}>Paste SVG markup to preview</span>
          )}
        </div>
      </div>
    </form>
  )
}
