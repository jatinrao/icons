import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getIconById } from '@/lib/icons'
import { IconForm } from '@/components/IconForm'
import { deleteIconAction, updateIconAction } from '../../../actions'

export default async function EditIconPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const icon = await getIconById(db, id)
  if (!icon) notFound()

  const boundUpdate = updateIconAction.bind(null, id)
  const boundDelete = deleteIconAction.bind(null, id)

  return (
    <div className="page">
      <div className="topbar">
        <h1>Edit icon</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/" className="button">
            Cancel
          </Link>
          <form action={boundDelete}>
            <button type="submit" className="button danger">
              Delete
            </button>
          </form>
        </div>
      </div>

      <IconForm
        action={boundUpdate}
        submitLabel="Save changes"
        initialValues={{
          name: icon.name,
          label: icon.label,
          svg: icon.svg,
          tags: (JSON.parse(icon.tags) as string[]).join(', '),
          category: icon.category ?? '',
        }}
      />
    </div>
  )
}
