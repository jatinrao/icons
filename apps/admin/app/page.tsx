import Link from 'next/link'
import { db } from '@/lib/db'
import { listIcons } from '@/lib/icons'
import { logoutAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function IconsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const icons = await listIcons(db, q)

  return (
    <div className="page">
      <div className="topbar">
        <h1>Icons ({icons.length})</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/icons/new" className="button primary">
            Add icon
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="button">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <form>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search by name, label, or tag…"
          className="search"
        />
      </form>

      {icons.length === 0 ? (
        <p className="empty">No icons found.</p>
      ) : (
        <div className="icon-grid">
          {icons.map((icon) => (
            <Link key={icon.id} href={`/icons/${icon.id}/edit`} className="icon-tile">
              <span className="glyph" dangerouslySetInnerHTML={{ __html: icon.svg }} />
              <span className="name">{icon.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
