import { describe, expect, it, vi } from 'vitest'
import { createSessionToken, verifySessionToken } from '../session'

describe('session tokens', () => {
  it('round-trips: a freshly created token verifies against the same secret', async () => {
    const token = await createSessionToken('secret-a')
    expect(await verifySessionToken(token, 'secret-a')).toBe(true)
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken('secret-a')
    expect(await verifySessionToken(token, 'secret-b')).toBe(false)
  })

  it('rejects a tampered token', async () => {
    const token = await createSessionToken('secret-a')
    const [payload, signature] = token.split('.')

    // Flip the signature's first base64url character. Unlike the last
    // character of a 32-byte digest (which can sit on a padding boundary
    // and leave the decoded bytes unchanged for some substitutions), the
    // first character always encodes a full 6 bits of real signature data,
    // so this is guaranteed to change the decoded bytes.
    const flipped = signature[0] === 'A' ? 'B' : 'A'
    const tampered = `${payload}.${flipped}${signature.slice(1)}`

    expect(await verifySessionToken(tampered, 'secret-a')).toBe(false)
  })

  it('rejects undefined/empty tokens', async () => {
    expect(await verifySessionToken(undefined, 'secret-a')).toBe(false)
    expect(await verifySessionToken('', 'secret-a')).toBe(false)
    expect(await verifySessionToken('not-a-real-token', 'secret-a')).toBe(false)
  })

  it('rejects an expired token', async () => {
    const realNow = Date.now()
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(realNow - 1000 * 60 * 60 * 24 * 8) // 8 days ago
    const token = await createSessionToken('secret-a')
    nowSpy.mockRestore()

    expect(await verifySessionToken(token, 'secret-a')).toBe(false)
  })
})
