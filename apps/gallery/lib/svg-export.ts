export function svgToDataUrl(svg: string): string {
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(svg, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(svg)))
  return `data:image/svg+xml;base64,${base64}`
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/** Rasterizes SVG markup to a square PNG blob at `size`x`size`. */
export async function svgToPngBlob(svg: string, size = 512): Promise<Blob> {
  const dataUrl = svgToDataUrl(svg)

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load SVG for rasterization'))
    img.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(image, 0, 0, size, size)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to rasterize SVG to PNG'))
    }, 'image/png')
  })
}
