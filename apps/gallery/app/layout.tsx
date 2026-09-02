import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SITE_NAME, SITE_URL, siteDescription } from '@/lib/site'
import { FloatingControls } from '@/components/FloatingControls'
import './globals.css'

// "Free" already carries the site's meta description (siteDescription()) and
// the FAQ answers on every icon page — it doesn't need to repeat in every
// title tag too, which was flattening 630+ pages toward the same phrase
// instead of each title pulling its own weight.
const HOME_TITLE = `${SITE_NAME} — SVG icons for React, portfolios & design`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: siteDescription(),
  keywords: [
    'svg icons',
    'react icons',
    'icon library',
    'free icons',
    'developer icons',
    'portfolio icons',
    'tech stack icons',
    'social media icons',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: siteDescription(),
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: siteDescription(),
  },
}

// Reads the persisted theme before hydration so there's no flash of the
// wrong theme on load.
const themeInitScript = `
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        document.documentElement.dataset.theme = stored;
      }
    } catch (e) {}
  })();
`

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        {modal}
        <FloatingControls />
        <Analytics />
      </body>
    </html>
  )
}
