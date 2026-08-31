import Link from 'next/link'
import { GITHUB_URL, NPM_URL, REQUEST_ICON_URL, SITE_NAME } from '@/lib/site'

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label={`${SITE_NAME} home`}>
          <img src="/icon.png" alt="" width={32} height={32} className="brand-logo" />
          <span className="brand-name">{SITE_NAME}</span>
        </Link>

        <div className="header-actions">
          <nav className="header-links" aria-label="Project links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="header-link">
              GitHub
            </a>
            <a href={NPM_URL} target="_blank" rel="noreferrer" className="header-link">
              npm
            </a>
          </nav>

          <a href={REQUEST_ICON_URL} target="_blank" rel="noreferrer" className="button primary pill">
            Raise Issue
          </a>
        </div>
      </div>
    </header>
  )
}
