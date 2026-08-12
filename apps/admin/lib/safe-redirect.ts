/**
 * Only follow a same-site path — never an absolute/protocol-relative URL
 * like "//evil.com" or "https://evil.com" (open redirect).
 */
export function safeRedirectTarget(from: FormDataEntryValue | string | null | undefined): string {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return '/'
  }
  return from
}
