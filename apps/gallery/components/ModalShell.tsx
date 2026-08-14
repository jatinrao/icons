'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'

export function ModalShell({ label, children }: { label: string; children: ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement | null>(null)

  function close() {
    router.back()
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="modal-dialog glass"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" aria-label="Close" className="modal-close" onClick={close}>
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
