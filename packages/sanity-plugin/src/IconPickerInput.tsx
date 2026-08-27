import { useCallback, useEffect, useMemo, useState } from 'react'
import { set, unset, type StringInputProps } from 'sanity'
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  rem,
} from '@sanity/ui'
import { ImageIcon, SearchIcon, TrashIcon, WarningOutlineIcon } from '@sanity/icons'
// Named import, not the default: styled-components v6 ships CJS with no
// `exports` map, so under plain Node ESM a default import resolves to the
// module namespace instead of the factory. Bundlers paper over that with
// __esModule interop; Node doesn't, and neither should this package.
import { styled } from 'styled-components'
import { Icon } from '@web-portfolio/icons'
import { metadata } from '@web-portfolio/icons-core'

/**
 * The shape of one metadata entry, redeclared here rather than re-exported
 * from icons-core. icons-core is private and unpublished, so any reference to
 * it that survives into dist/*.d.ts is a type import consumers cannot resolve.
 * Structurally identical to icons-core's `IconMetadata` — and the picker
 * passes real metadata entries to the functions below, so a drift in the
 * fields this actually uses fails typecheck at those call sites.
 *
 * Rendering (viewBox/innerHTML) isn't part of this shape at all: the picker
 * delegates actual icon markup to `@web-portfolio/icons`'s `<Icon>` rather
 * than reading SVG data out of icons-core directly, so this package never
 * needs to bundle it.
 */
export interface IconEntry {
  label: string
  tags: string[]
  category: string | null
}

/**
 * The bundled icon set is 600+ icons. Mounting every inline SVG at once makes
 * opening the dialog visibly janky in Studio, so results render a page at a
 * time and the rest are one click away.
 */
const PAGE_SIZE = 96

const PREVIEW_ICON_SIZE = 28
const GRID_ICON_SIZE = 24

/** Roughly five rows of tiles — enough to scan, short enough to leave the
 * search field and the dialog footer visible without scrolling. */
const RESULTS_MAX_HEIGHT = 400

/**
 * Geometry comes off the Sanity UI space scale rather than hardcoded pixels,
 * so the picker rescales with the Studio theme exactly like the built-in
 * inputs do. Everything else (color, border, radius, focus ring, typography)
 * is left to Sanity UI's own components so the field inherits whichever
 * theme and color scheme the Studio is running.
 */
const PreviewFrame = styled(Card)`
  flex-shrink: 0;
  width: ${({ theme }) => rem(PREVIEW_ICON_SIZE + theme.sanity.space[3] * 2)};
  height: ${({ theme }) => rem(PREVIEW_ICON_SIZE + theme.sanity.space[3] * 2)};
`

const ResultsScroller = styled(Box)`
  max-height: ${rem(RESULTS_MAX_HEIGHT)};
  overflow-y: auto;
  /* Keep a trackpad flick inside the grid from scrolling the document behind
     the dialog once the list bottoms out. */
  overscroll-behavior: contain;
`

/**
 * Sanity UI ships a `[data-as='button']` rule on Card that zeroes the border
 * and forces `cursor: default` — it outranks a plain class selector, so these
 * overrides have to match it and then some (`&&` doubles the class) to land.
 */
/** One line of label text plus its top padding, in the Sanity UI space scale
 * — matches the `space={2}` gap the tile's inner Stack uses. Multi-word names
 * ("Amazon Web Services", "Apache Airflow") are long enough to wrap onto a
 * second line if this isn't pinned, and a taller-than-expected cell throws
 * off every grid row after it (rows overlap the ones below). */
const LABEL_ROW_HEIGHT = 20

const IconTile = styled(Card)`
  &&[data-as='button'] {
    cursor: pointer;
    /* Card's button reset drops the border; put it back so grid cells read as
       discrete targets rather than a field of floating glyphs. */
    border: 1px solid var(--card-border-color);
    /* Without this a long label ("Google Cloud Platform") widens its grid
       column and knocks the whole row out of alignment. */
    min-width: 0;
    /* Every tile in a row must be the same height for the grid's implicit
       row track to size correctly — an overflowing label would otherwise
       stretch its own row and visually collide with the row underneath. */
    overflow: hidden;
  }
`

const GlyphRow = styled(Flex)`
  height: ${({ theme }) => rem(theme.sanity.space[5])};
`

const LabelRow = styled(Box)`
  /* min-height, not height + overflow: hidden — Sanity UI's Text renders its
     glyphs slightly outside its own collapsed box (a negative-margin trick
     it uses for tight optical leading), so clipping here or on \`> *\` cut
     the top off every label instead of just truncating long ones. Overflow
     protection is unnecessary anyway: Text's own \`textOverflow="ellipsis"\`
     prop already forces single-line truncation via its internal span, so a
     long label can't wrap and grow the tile regardless. */
  min-height: ${rem(LABEL_ROW_HEIGHT)};
`

const CategorySelectBox = styled(Box)`
  /* Wide enough for the longest category label without letting the select
     crowd out the search field. */
  width: ${rem(180)};
`

export function matchesQuery(name: string, entry: IconEntry, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    name.toLowerCase().includes(q) ||
    entry.label.toLowerCase().includes(q) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

/**
 * Alphabetical order alone buries the obvious answer: searching "react" put
 * `react` behind nothing, but searching "go" led with `godot` and `gopher`
 * rather than `go`. Lower score wins; ties fall back to alphabetical.
 */
export function rankMatch(name: string, entry: IconEntry, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const lowerName = name.toLowerCase()
  const lowerLabel = entry.label.toLowerCase()

  if (lowerName === q || lowerLabel === q) return 0
  if (lowerName.startsWith(q)) return 1
  if (lowerLabel.startsWith(q)) return 2
  if (lowerName.includes(q) || lowerLabel.includes(q)) return 3
  return 4
}

/**
 * "original"/"original-wordmark" are devicon's internal variant names, which
 * mean nothing to an editor picking an icon — label them by source instead.
 * Every other category gets the generic title-cased transform, so a category
 * added to the registry later still reads correctly without a code change.
 * Mirrors `formatCategoryLabel` in the public gallery.
 */
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  original: 'Devicon',
  'original-wordmark': 'Devicon Wordmark',
}

export function formatCategoryLabel(category: string): string {
  if (CATEGORY_LABEL_OVERRIDES[category]) return CATEGORY_LABEL_OVERRIDES[category]
  return category
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function IconPickerInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const names = useMemo(() => Object.keys(metadata).sort(), [])

  const categories = useMemo(() => {
    const found = new Set<string>()
    for (const name of names) {
      const entry = metadata[name]
      if (entry.category) found.add(entry.category)
    }
    return Array.from(found).sort()
  }, [names])

  const filtered = useMemo(() => {
    const matches = names.filter((name) => {
      const entry = metadata[name]
      if (category && entry.category !== category) return false
      return matchesQuery(name, entry, query)
    })

    if (!query.trim()) return matches
    return matches.sort(
      (a, b) => rankMatch(a, metadata[a], query) - rankMatch(b, metadata[b], query),
    )
  }, [names, query, category])

  // A stale offset would leave "Show more" hidden — or worse, show an empty
  // page — the moment the result set shrinks under the current count.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, category])

  const visible = filtered.slice(0, visibleCount)
  const remaining = filtered.length - visible.length

  const selectedEntry = value ? metadata[value] : undefined
  // A value that isn't in the bundled set (icon renamed or dropped upstream)
  // used to render as a bare "?" with no way to tell what had happened.
  const hasUnknownValue = Boolean(value && !selectedEntry)

  const closeDialog = useCallback(() => {
    setOpen(false)
    setQuery('')
    setCategory('')
  }, [])

  const handleSelect = useCallback(
    (name: string) => {
      if (readOnly) return
      onChange(set(name))
      closeDialog()
    },
    [readOnly, onChange, closeDialog],
  )

  const handleClear = useCallback(() => {
    if (readOnly) return
    onChange(unset())
  }, [readOnly, onChange])

  // Sanity drives focus, presence and the field label's `htmlFor` through
  // `elementProps`. Only the focus-tracking half applies here — `value`,
  // `onChange` and `placeholder` are meant for a real <input>, which this
  // input deliberately doesn't render.
  const focusProps = {
    id: elementProps?.id,
    onFocus: elementProps?.onFocus,
    onBlur: elementProps?.onBlur,
    ref: elementProps?.ref,
    'aria-describedby': elementProps?.['aria-describedby'],
  }

  return (
    <Stack space={3}>
      <Flex align="center" gap={3}>
        <PreviewFrame
          padding={3}
          radius={2}
          border
          tone={hasUnknownValue ? 'caution' : 'default'}
        >
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%' }}>
            {selectedEntry ? (
              <Icon name={value as string} size={PREVIEW_ICON_SIZE} />
            ) : (
              <Text size={1} muted>
                {hasUnknownValue ? <WarningOutlineIcon /> : <ImageIcon />}
              </Text>
            )}
          </Flex>
        </PreviewFrame>

        <Stack space={3} flex={1}>
          <Stack space={2}>
            <Flex align="center" gap={2}>
              <Text size={1} weight="semibold" textOverflow="ellipsis">
                {value ? (selectedEntry?.label ?? value) : 'No icon selected'}
              </Text>
              {selectedEntry?.category && (
                <Badge tone="primary" fontSize={0} radius={2}>
                  {formatCategoryLabel(selectedEntry.category)}
                </Badge>
              )}
            </Flex>
            {selectedEntry && (
              // The stored value is what the frontend passes to <Icon name>,
              // so it's worth surfacing next to the human-readable label.
              <Text size={0} muted>
                <code>{value}</code>
              </Text>
            )}
          </Stack>

          <Flex gap={2}>
            <Button
              text={value ? 'Change icon' : 'Select icon'}
              icon={value ? undefined : ImageIcon}
              mode="ghost"
              disabled={readOnly}
              onClick={() => setOpen(true)}
              {...focusProps}
            />
            {value && (
              <Button
                text="Clear"
                icon={TrashIcon}
                mode="bleed"
                tone="critical"
                disabled={readOnly}
                onClick={handleClear}
              />
            )}
          </Flex>
        </Stack>
      </Flex>

      {hasUnknownValue && (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>
            This field holds <code>{value}</code>, which isn&rsquo;t in the bundled icon set. It may
            have been renamed or removed — pick a replacement, or clear the field.
          </Text>
        </Card>
      )}

      {open && (
        <Dialog
          id="icon-picker"
          header="Select an icon"
          onClose={closeDialog}
          onClickOutside={closeDialog}
          width={2}
          footer={
            <Flex padding={3} align="center" justify="space-between" gap={3}>
              <Text size={1} muted>
                {filtered.length === names.length
                  ? `${names.length} icons`
                  : `${filtered.length} of ${names.length} icons`}
              </Text>
              <Button text="Cancel" mode="bleed" onClick={closeDialog} />
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={4}>
              <Flex gap={2}>
                <Box flex={1}>
                  <TextInput
                    icon={SearchIcon}
                    placeholder="Search by name, label, or tag…"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    clearButton={query.length > 0}
                    onClear={() => setQuery('')}
                    radius={2}
                    autoFocus
                  />
                </Box>
                <CategorySelectBox>
                  <Select
                    value={category}
                    onChange={(event) => setCategory(event.currentTarget.value)}
                    radius={2}
                    aria-label="Filter by category"
                  >
                    <option value="">All categories</option>
                    {categories.map((name) => (
                      <option key={name} value={name}>
                        {formatCategoryLabel(name)}
                      </option>
                    ))}
                  </Select>
                </CategorySelectBox>
              </Flex>

              {filtered.length === 0 ? (
                <Card padding={5} radius={2} tone="transparent">
                  <Stack space={3}>
                    <Text align="center" size={1} weight="semibold">
                      No icons match that search
                    </Text>
                    <Text align="center" size={1} muted>
                      Try a shorter term, or reset the category filter.
                    </Text>
                  </Stack>
                </Card>
              ) : (
                <ResultsScroller>
                  <Stack space={3}>
                    <Grid columns={[3, 4, 6]} gap={2}>
                      {visible.map((name) => {
                        const entry = metadata[name]
                        const isSelected = name === value

                        return (
                          <Tooltip
                            key={name}
                            content={
                              <Box padding={2}>
                                <Text size={1}>{name}</Text>
                              </Box>
                            }
                            placement="top"
                            delay={{ open: 400 }}
                            portal
                          >
                            <IconTile
                              // `forwardedAs`, not `as`: styled-components
                              // would consume `as` itself and render a bare
                              // <button>, throwing away every Card style and
                              // leaking `border`/`pressed` onto the DOM node.
                              // This hands it to Card, which knows how to be
                              // a themed button.
                              forwardedAs="button"
                              type="button"
                              padding={3}
                              radius={2}
                              border
                              tone={isSelected ? 'primary' : 'default'}
                              pressed={isSelected}
                              __unstable_focusRing
                              aria-pressed={isSelected}
                              aria-label={`${entry.label} (${name})`}
                              onClick={() => handleSelect(name)}
                            >
                              <Stack space={2}>
                                <GlyphRow align="center" justify="center">
                                  <Icon name={name} size={GRID_ICON_SIZE} />
                                </GlyphRow>
                                <LabelRow>
                                  <Text size={0} align="center" muted textOverflow="ellipsis">
                                    {entry.label}
                                  </Text>
                                </LabelRow>
                              </Stack>
                            </IconTile>
                          </Tooltip>
                        )
                      })}
                    </Grid>

                    {remaining > 0 && (
                      <Button
                        mode="ghost"
                        width="fill"
                        text={`Show ${Math.min(remaining, PAGE_SIZE)} more`}
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      />
                    )}
                  </Stack>
                </ResultsScroller>
              )}
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  )
}
