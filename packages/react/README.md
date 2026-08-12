# @web-portfolio/icons

A free React icon component with **622 bundled SVG icons** — programming
languages, frameworks, dev tools, social platforms, and common UI/navigation
icons — in one `<Icon />` component. Built for developer and designer
portfolios, resumes, personal websites, and dashboards that need a reliable
icon set without pulling in a huge dependency tree or making runtime network
calls.

[![npm version](https://img.shields.io/npm/v/@web-portfolio/icons.svg)](https://www.npmjs.com/package/@web-portfolio/icons)
[![license](https://img.shields.io/npm/l/@web-portfolio/icons.svg)](https://github.com/jatinrao/icons/blob/main/LICENSE)

## Why this package

If you're a **developer** building a portfolio site, you need tech-stack
logos (React, Node.js, Docker, PostgreSQL, TypeScript...) and social icons
(GitHub, LinkedIn, Twitter/X...) that actually match each other in style. If
you're a **designer** or building any kind of personal/professional site, you
need consistent, themeable SVG icons without a mess of `<img>` tags pointing
at external CDNs. This package covers both:

- **622 icons, zero runtime dependencies** — everything is bundled into the
  package at build time. No API calls, no CDN, no loading spinners.
- **One dynamic component** — `<Icon name="react" />` instead of importing a
  separate component per icon.
- **Themeable** — `color`, `stroke`, and `strokeWidth` props so icons follow
  your site's color scheme (`currentColor` by default, so most icons inherit
  your text color automatically).
- **Fully typed** — ships its own `.d.ts`, works out of the box with
  TypeScript.
- **Tiny footprint per icon** — tree-shaking aside, the whole registry is
  optimized SVG (via SVGO) at build time.

## Installation

```bash
npm install @web-portfolio/icons
```

```bash
pnpm add @web-portfolio/icons
```

```bash
yarn add @web-portfolio/icons
```

Requires React 18 or later.

## Quick start

```tsx
import { Icon } from '@web-portfolio/icons'

function TechStack() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Icon name="react" size={32} />
      <Icon name="typescript" size={32} />
      <Icon name="nodejs" size={32} />
      <Icon name="postgresql" size={32} />
      <Icon name="docker" size={32} />
    </div>
  )
}
```

### Social links in a portfolio footer

```tsx
import { Icon } from '@web-portfolio/icons'

function SocialLinks() {
  return (
    <nav aria-label="Social links">
      <a href="https://github.com/you" aria-label="GitHub">
        <Icon name="github" title="GitHub" />
      </a>
      <a href="https://linkedin.com/in/you" aria-label="LinkedIn">
        <Icon name="linkedin" title="LinkedIn" />
      </a>
      <a href="mailto:you@example.com" aria-label="Email">
        <Icon name="mail" title="Email" />
      </a>
    </nav>
  )
}
```

### Theming with color, stroke, and strokeWidth

```tsx
// Fill color follows your palette (monochrome icons only — see note below)
<Icon name="mail" color="#6366f1" size={20} />

// Line-style icons: adjust stroke and stroke width directly
<Icon name="arrow_forward" stroke="#0ea5e9" strokeWidth={1.5} size={24} />
```

## API

```ts
<Icon
  name="react"          // required — the icon's registry name
  size={24}              // number | string — width & height, default 24
  color="currentColor"   // fill color, default currentColor
  stroke={undefined}     // stroke color override
  strokeWidth={undefined}// stroke width override
  title={undefined}      // accessible name; adds role="img" when set
  className="my-icon"    // any other standard <svg> prop is passed through
/>
```

| Prop          | Type               | Default        | Notes                                                                                          |
| ------------- | ------------------ | -------------- | ------------------------------------------------------------------------------------------------ |
| `name`        | `string`            | —              | Required. Unknown names render nothing and log a dev-only warning instead of throwing.           |
| `size`        | `number \| string`  | `24`           | Sets both `width` and `height`.                                                                  |
| `color`       | `string`            | `currentColor` | Only affects monochrome icons — multi-color brand marks keep their original colors.              |
| `stroke`      | `string`            | —              | Overrides any stroke the icon's markup declares, and sets it on the root `<svg>`.                |
| `strokeWidth` | `number \| string`  | —              | Applied the same way as `stroke`.                                                                 |
| `title`       | `string`            | —              | Adds an accessible `<title>` and `role="img"`. Omit for a purely decorative icon (`aria-hidden`). |

Any other prop (`className`, `onClick`, `style`, ...) passes straight through
to the underlying `<svg>` element.

## What's in the icon set

622 icons from three sources, normalized to a consistent style:

- **[devicon](https://github.com/devicons/devicon)** (578 icons, MIT) —
  programming languages, frameworks, databases, cloud platforms, and dev
  tools. `react`, `typescript`, `nodejs`, `docker`, `postgresql`, `figma`,
  `amazonwebservices`, `kubernetes`, and hundreds more.
- **[Material Symbols](https://github.com/marella/material-symbols)** (32
  icons, Apache-2.0) — communication and navigation icons: `mail`, `call`,
  `arrow_forward`, `menu`, `close`, and more.
- **[Simple Icons](https://simpleicons.org)** (12 icons, CC0-1.0) — social
  platform logos devicon doesn't cover: `instagram`, `youtube`, `whatsapp`,
  `telegram`, `tiktok`, `discord`, and more (devicon already covers GitHub,
  LinkedIn, Twitter/X, GitLab, and Slack).

Browse the full, searchable list — with live previews and copy-paste usage
snippets for every icon — at the [source repo](https://github.com/jatinrao/icons).

## TypeScript

The package ships its own type declarations — no `@types/` package needed.
`IconProps` is exported if you want to type a wrapper component:

```ts
import { Icon, type IconProps } from '@web-portfolio/icons'
```

## Managing your own icons in the CMS

Building with [Sanity](https://www.sanity.io)? Pair this with
[`@web-portfolio/icons-sanity`](https://www.npmjs.com/package/@web-portfolio/icons-sanity)
to let editors pick icons from a searchable picker in Studio, backed by the
same 622-icon registry — no more pasting raw SVG markup into every field.

## License

MIT — see [LICENSE](https://github.com/jatinrao/icons/blob/main/LICENSE).
Bundled icon sets keep their original licenses (devicon: MIT, Material
Symbols: Apache-2.0, Simple Icons: CC0-1.0) — see the
[repo README](https://github.com/jatinrao/icons#attribution) for full
attribution.
