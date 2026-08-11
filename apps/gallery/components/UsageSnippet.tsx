'use client'

import { useState } from 'react'

export function UsageSnippet({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  const snippet = `<Icon name="${name}" />`

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className="usage-snippet"
      onClick={handleCopy}
      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}
      title="Click to copy"
    >
      <code>{snippet}</code>
      <span style={{ color: 'var(--muted)', fontSize: '0.75rem', flexShrink: 0 }}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}
