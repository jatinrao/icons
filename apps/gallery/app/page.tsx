import { db } from '@/lib/db'
import { getAllIcons } from '@/lib/icons'
import { IconGrid } from '@/components/IconGrid'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Footer } from '@/components/Footer'

export const revalidate = 3600

export default async function HomePage() {
  const icons = await getAllIcons(db).catch((error) => {
    console.warn('[gallery] HomePage: failed to load icons', error)
    return []
  })
  icons.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <h1>Icons</h1>
          <span className="count">{icons.length} icons</span>
        </div>
        <DarkModeToggle />
      </div>

      <IconGrid icons={icons} />
      <Footer />
    </div>
  )
}
