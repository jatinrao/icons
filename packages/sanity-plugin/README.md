# @web-portfolio/icons-sanity

A [Sanity Studio](https://www.sanity.io) plugin that adds an **icon picker
field** backed by a bundled library of **622 SVG icons** — so content editors
can pick an icon by searching a name, tag, or category instead of pasting raw
SVG markup into every field. Built for portfolio sites, agency/marketing
sites, and any Sanity project where editors need to attach icons to skills,
tech stacks, services, or social/contact links — without needing design or
dev help for every change.

[![npm version](https://img.shields.io/npm/v/@web-portfolio/icons-sanity.svg)](https://www.npmjs.com/package/@web-portfolio/icons-sanity)
[![license](https://img.shields.io/npm/l/@web-portfolio/icons-sanity.svg)](https://github.com/jatinrao/icons/blob/main/LICENSE)

## Why this plugin

If you're a **developer** shipping a portfolio or personal-site CMS setup,
you've probably built a "paste an SVG" field before — it works, but it means
every content edit needs someone who knows what valid SVG markup looks like.
This plugin replaces that with a proper picker:

- **622 icons out of the box** — tech/tool logos, social platform icons, and
  common communication/navigation icons (see [Icon set](#whats-in-the-icon-set)).
  Editors search by name, tag, or category; no SVG knowledge required.
- **No API calls from Studio** — the entire icon registry is bundled into the
  plugin at build time, so the picker works offline and loads instantly.
  Nothing is fetched from a database or CDN while editing.
- **Stores just a name** — the field value is a plain string (`"react"`,
  `"github"`, ...), which pairs directly with
  [`@web-portfolio/icons`](https://www.npmjs.com/package/@web-portfolio/icons)'s
  `<Icon name="..." />` on your frontend — no ID lookups, no asset references.
- **Live preview** — the currently selected icon renders inline in the form,
  not just its name.

## Installation

```bash
npm install @web-portfolio/icons-sanity
```

```bash
pnpm add @web-portfolio/icons-sanity
```

Peer dependencies (already present in any standard Sanity Studio v3 project):
`sanity >=3`, `@sanity/ui >=2`, `react >=18`, `styled-components >=6`.

## Setup

Add the plugin to your Studio config:

```ts
// sanity.config.ts
import { defineConfig } from 'sanity'
import { sanityIconPicker } from '@web-portfolio/icons-sanity'

export default defineConfig({
  // ...your existing config
  plugins: [
    // ...your existing plugins
    sanityIconPicker(),
  ],
})
```

This registers an `iconRef` schema type you can use on any document or
object.

## Usage

Use `type: 'iconRef'` on any field that should store an icon:

```ts
// schemaTypes/documents/skill.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'icon', title: 'Icon', type: 'iconRef' }),
  ],
})
```

Editors click the field, search ("react", "docker", "mail"...), and select an
icon from a live-previewed grid. The field stores the icon's name as a plain
string — e.g. `"react"`.

### Social/contact links example

```ts
defineField({
  name: 'socialLinks',
  title: 'Social links',
  type: 'array',
  of: [
    defineType({
      type: 'object',
      name: 'socialLink',
      fields: [
        defineField({ name: 'icon', type: 'iconRef' }),
        defineField({ name: 'url', type: 'url' }),
      ],
    }),
  ],
})
```

### Rendering the picked icon on your frontend

Pair with [`@web-portfolio/icons`](https://www.npmjs.com/package/@web-portfolio/icons)
— pass the stored string straight through as `name`:

```tsx
import { Icon } from '@web-portfolio/icons'

function SkillBadge({ skill }: { skill: { name: string; icon: string } }) {
  return (
    <span>
      <Icon name={skill.icon} size={20} />
      {skill.name}
    </span>
  )
}
```

## What's in the icon set

622 icons from three sources, shared with `@web-portfolio/icons`:

- **[devicon](https://github.com/devicons/devicon)** (578 icons, MIT) —
  programming languages, frameworks, databases, cloud platforms, dev tools.
- **[Material Symbols](https://github.com/marella/material-symbols)** (32
  icons, Apache-2.0) — communication and navigation icons (mail, call,
  arrows, menu, close, ...).
- **[Simple Icons](https://simpleicons.org)** (12 icons, CC0-1.0) — social
  platform logos devicon doesn't cover (Instagram, YouTube, WhatsApp,
  Telegram, TikTok, Discord, ...).

## License

MIT — see [LICENSE](https://github.com/jatinrao/icons/blob/main/LICENSE).
Bundled icon sets keep their original licenses (devicon: MIT, Material
Symbols: Apache-2.0, Simple Icons: CC0-1.0) — see the
[repo README](https://github.com/jatinrao/icons#attribution) for full
attribution.
