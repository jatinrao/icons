const REQUEST_ICON_URL =
  'https://github.com/jatinrao/icons/issues/new?title=Icon+request%3A+&labels=icon-request'

export function Footer() {
  return (
    <footer className="footer">
      <span>
        Icons seeded from{' '}
        <a href="https://github.com/devicons/devicon" target="_blank" rel="noreferrer">
          devicon
        </a>
        ,{' '}
        <a href="https://github.com/marella/material-symbols" target="_blank" rel="noreferrer">
          Material Symbols
        </a>
        , and{' '}
        <a href="https://simpleicons.org" target="_blank" rel="noreferrer">
          Simple Icons
        </a>
        .
      </span>
      <a href={REQUEST_ICON_URL} target="_blank" rel="noreferrer">
        Can&rsquo;t find an icon? Request it →
      </a>
    </footer>
  )
}
