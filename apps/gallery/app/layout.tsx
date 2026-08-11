import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Icons Gallery',
  description: 'Browse and copy tech icons, seeded from devicon.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
