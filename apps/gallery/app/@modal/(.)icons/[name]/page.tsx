import { notFound } from 'next/navigation'
import { getIconByName } from '@/lib/icons'
import { IconDetailPanel } from '@/components/IconDetailPanel'
import { ModalShell } from '@/components/ModalShell'

// Intercepts client-side navigation from the grid to /icons/[name] and shows
// it as a modal over the grid instead of a full page transition. A hard
// reload or direct link still hits the real app/icons/[name]/page.tsx —
// this route is never the thing search engines or shared links see.
export default async function IconModal({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIconByName(name)
  if (!icon) notFound()

  return (
    <ModalShell label={`${icon.label} icon details`}>
      <IconDetailPanel icon={icon} />
    </ModalShell>
  )
}
