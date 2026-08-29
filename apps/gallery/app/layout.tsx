import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL, siteDescription } from '@/lib/site'
import { FloatingControls } from '@/components/FloatingControls'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free SVG icons for React, portfolios & design`,
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
    title: `${SITE_NAME} — Free SVG icons for React, portfolios & design`,
    description: siteDescription(),
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Free SVG icons for React, portfolios & design`,
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
      </body>
    </html>
  )
}
