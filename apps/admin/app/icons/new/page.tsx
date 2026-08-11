import Link from 'next/link'
import { IconForm } from '@/components/IconForm'
import { createIconAction } from '../../actions'

export default function NewIconPage() {
  return (
    <div className="page">
      <div className="topbar">
        <h1>Add icon</h1>
        <Link href="/" className="button">
          Cancel
        </Link>
      </div>
      <IconForm action={createIconAction} submitLabel="Create icon" />
    </div>
  )
}
