import 'styled-components'
import type { Theme } from '@sanity/ui'

/**
 * @sanity/ui hangs its entire token set off `theme.sanity` when its
 * ThemeProvider mounts, but ships no styled-components module augmentation of
 * its own — without this, `({ theme }) => theme.sanity.space[3]` inside a
 * styled() block is a type error. Declaration-only: nothing here is emitted
 * into dist/, so it can't leak into a consumer's type space.
 */
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
