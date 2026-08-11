const REQUEST_ICON_URL =
  'https://github.com/jatinrao/icons/issues/new?title=Icon+request%3A+&labels=icon-request'

export function Footer() {
  return (
    <footer className="footer">
      <span>
        Icons seeded from{' '}
        <a href="https://github.com/devicons/devicon" target="_blank" rel="noreferrer">
          devicon
        </a>{' '}
        (MIT licensed).
      </span>
      <a href={REQUEST_ICON_URL} target="_blank" rel="noreferrer">
        Can&rsquo;t find an icon? Request it →
      </a>
    </footer>
  )
}
