// Web Crypto only (no `node:crypto`) so this module works in both the Node.js
// server-action runtime and the Edge middleware runtime.

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = encoder.encode(`admin.${expiresAt}`)
  const key = await getKey(secret)
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload))
  return `${base64UrlEncode(payload)}.${base64UrlEncode(signature)}`
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token) return false

  const [payloadPart, signaturePart] = token.split('.')
  if (!payloadPart || !signaturePart) return false

  try {
    const payload = base64UrlDecode(payloadPart)
    const signature = base64UrlDecode(signaturePart)
    const key = await getKey(secret)
    const valid = await crypto.subtle.verify('HMAC', key, signature as BufferSource, payload as BufferSource)
    if (!valid) return false

    const [, expiresAtStr] = decoder.decode(payload).split('.')
    const expiresAt = Number(expiresAtStr)
    return Number.isFinite(expiresAt) && Date.now() < expiresAt
  } catch {
    return false
  }
}

export const SESSION_COOKIE_NAME = 'admin_session'
