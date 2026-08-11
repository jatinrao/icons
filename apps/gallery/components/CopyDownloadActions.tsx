'use client'

import { useState } from 'react'
import { svgToPngBlob, triggerDownload } from '@/lib/svg-export'

interface CopyDownloadActionsProps {
  name: string
  svg: string
}

type ActionKey = 'copy-svg' | 'copy-png' | 'download-svg' | 'download-png'

const LABELS: Record<ActionKey, string> = {
  'copy-svg': 'Copy SVG',
  'copy-png': 'Copy PNG',
  'download-svg': 'Download SVG',
  'download-png': 'Download PNG',
}

export function CopyDownloadActions({ name, svg }: CopyDownloadActionsProps) {
  const [status, setStatus] = useState<Partial<Record<ActionKey, 'done' | 'error'>>>({})

  async function runAction(key: ActionKey, action: () => Promise<void>) {
    try {
      await action()
      setStatus((prev) => ({ ...prev, [key]: 'done' }))
    } catch (error) {
      console.error(`[gallery] ${key} failed`, error)
      setStatus((prev) => ({ ...prev, [key]: 'error' }))
    } finally {
      setTimeout(() => setStatus((prev) => ({ ...prev, [key]: undefined })), 1500)
    }
  }

  function label(key: ActionKey): string {
    if (status[key] === 'done') return 'Copied!'
    if (status[key] === 'error') return 'Failed'
    return LABELS[key]
  }

  return (
    <div className="action-grid">
      <button
        type="button"
        className="button primary"
        onClick={() => runAction('copy-svg', () => navigator.clipboard.writeText(svg))}
      >
        {label('copy-svg')}
      </button>

      <button
        type="button"
        className="button"
        onClick={() =>
          runAction('copy-png', async () => {
            const blob = await svgToPngBlob(svg)
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          })
        }
      >
        {label('copy-png')}
      </button>

      <button
        type="button"
        className="button"
        onClick={() =>
          runAction('download-svg', async () => {
            triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`)
          })
        }
      >
        {LABELS['download-svg']}
      </button>

      <button
        type="button"
        className="button"
        onClick={() =>
          runAction('download-png', async () => {
            const blob = await svgToPngBlob(svg)
            triggerDownload(blob, `${name}.png`)
          })
        }
      >
        {LABELS['download-png']}
      </button>
    </div>
  )
}
