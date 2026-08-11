import { useMemo, useState } from 'react'
import { set, unset, type StringInputProps } from 'sanity'
import { Box, Button, Card, Dialog, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui'
import { registry, type RegistryEntry } from '@web-portfolio/icons-core'

function IconGlyph({ name, size = 24 }: { name: string; size?: number }) {
  const entry = registry[name]
  if (!entry) return null

  return (
    <svg
      viewBox={entry.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: entry.innerHTML }}
    />
  )
}

export function matchesQuery(name: string, entry: RegistryEntry, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    name.toLowerCase().includes(q) ||
    entry.label.toLowerCase().includes(q) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

export function IconPickerInput(props: StringInputProps) {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const names = useMemo(() => Object.keys(registry).sort(), [])
  const filtered = useMemo(
    () => names.filter((name) => matchesQuery(name, registry[name], query)),
    [names, query],
  )

  const selectedEntry = value ? registry[value] : undefined

  const handleSelect = (name: string) => {
    onChange(set(name))
    setOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    onChange(unset())
  }

  return (
    <Stack space={3}>
      <Flex align="center" gap={3}>
        <Card padding={3} radius={2} border style={{ width: 56, height: 56, flexShrink: 0 }}>
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%' }}>
            {value ? (
              selectedEntry ? (
                <IconGlyph name={value} size={28} />
              ) : (
                <Text size={1} muted>
                  ?
                </Text>
              )
            ) : (
              <Text size={1} muted>
                None
              </Text>
            )}
          </Flex>
        </Card>

        <Stack space={2} flex={1}>
          <Text size={1} weight="semibold">
            {value ? (selectedEntry?.label ?? value) : 'No icon selected'}
          </Text>
          <Flex gap={2}>
            <Button text="Change" mode="ghost" onClick={() => setOpen(true)} />
            {value && <Button text="Clear" mode="ghost" tone="critical" onClick={handleClear} />}
          </Flex>
        </Stack>
      </Flex>

      {open && (
        <Dialog id="icon-picker" header="Choose an icon" onClose={() => setOpen(false)} width={2}>
          <Box padding={4}>
            <Stack space={4}>
              <TextInput
                placeholder="Search by name or tag…"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                autoFocus
              />

              <Text size={1} muted>
                {filtered.length} of {names.length} icons
              </Text>

              <Grid columns={[3, 4, 6]} gap={2} style={{ maxHeight: 420, overflowY: 'auto' }}>
                {filtered.map((name) => (
                  <Card
                    key={name}
                    as="button"
                    padding={3}
                    radius={2}
                    border
                    tone={name === value ? 'primary' : undefined}
                    onClick={() => handleSelect(name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Stack space={2}>
                      <Flex align="center" justify="center" style={{ height: 32 }}>
                        <IconGlyph name={name} size={24} />
                      </Flex>
                      <Text size={0} align="center" muted>
                        {registry[name].label}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  )
}
