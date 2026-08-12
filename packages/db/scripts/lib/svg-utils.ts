/**
 * Material Symbols and Simple Icons ship SVGs with no `fill` attribute
 * anywhere — they're designed to inherit color from CSS. That's fine for
 * the published package (Icon.tsx always sets fill on its own <svg>
 * wrapper), but a raw, standalone render of the stored markup (e.g. an
 * admin/gallery preview) would default to black. Bake an explicit
 * currentColor onto the root so the raw markup is self-sufficient too.
 */
export function ensureCurrentColorFill(svg: string): string {
  if (/<svg\b[^>]*\sfill=/.test(svg)) return svg
  return svg.replace(/<svg\b/, '<svg fill="currentColor"')
}
