'use client'

import Link from 'next/link'
import { formatCategoryLabel, type GalleryIcon } from '@/lib/icons'
import {
  MAX_SIZE,
  MAX_STROKE_WIDTH,
  MIN_SIZE,
  MIN_STROKE_WIDTH,
  STROKE_STEP,
  useIconCustomization,
} from '@/lib/use-icon-customization'
import { CopyDownloadActions } from './CopyDownloadActions'
import { UsageSnippet } from './UsageSnippet'

const PREVIEW_MAX_PX = 200

// A curated slice of the iOS system-accent palette, for quick color picks —
// the native color input below still covers any custom color.
const SWATCHES = [
  { label: 'Blue', hex: '#0088FF' },
  { label: 'Indigo', hex: '#6155F5' },
  { label: 'Purple', hex: '#CB30E0' },
  { label: 'Teal', hex: '#00C3D0' },
  { label: 'Orange', hex: '#FF8D28' },
  { label: 'Pink', hex: '#FF2D55' },
  { label: 'Green', hex: '#34C759' },
  { label: 'Black', hex: '#000000' },
]

export function IconDetailPanel({ icon }: { icon: GalleryIcon }) {
  const c = useIconCustomization(icon.svg)
  const previewPx = Math.min(c.customized ? c.size : 96, PREVIEW_MAX_PX)

  return (
    <div className="detail-panel">
      <div className="detail-panel-meta">
        <div
          className="detail-glyph"
          role="img"
          aria-label={`${icon.label} icon`}
          style={{ width: previewPx, height: previewPx }}
          dangerouslySetInnerHTML={{ __html: c.previewSvg }}
        />
        <div>
          {/* Only heading on /icons/[name] — sized to match the old <h2> default. */}
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5em' }}>{icon.label} icon</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>
            {icon.name}
          </p>
        </div>
        <div className="detail-tags">
          {icon.category && (
            <Link href={`/icons/category/${icon.category}`} className="tag tag-category">
              {formatCategoryLabel(icon.category)}
            </Link>
          )}
          {icon.tags.map((tag) => (
            <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <div className="detail-panel-controls">
        <label className="size-control" htmlFor="customize-size">
          Size ({c.size}px)
          <input
            id="customize-size"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={c.size}
            onChange={(event) => c.setSize(Number(event.currentTarget.value))}
          />
        </label>

        <div className="control-row">
          <div className="color-control">
            <span className="control-label">Color</span>
            <div role="group" aria-label="Icon color" className="swatch-row">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  aria-label={`${swatch.label} accent color`}
                  aria-pressed={c.color === swatch.hex}
                  className={`swatch${c.color === swatch.hex ? ' swatch-selected' : ''}`}
                  style={{ background: swatch.hex }}
                  onClick={() => c.setColor(swatch.hex)}
                />
              ))}
              <input
                aria-label="Color"
                type="color"
                value={c.color}
                onChange={(event) => c.setColor(event.currentTarget.value)}
              />
            </div>
          </div>
        </div>

        <button type="button" className="button" onClick={c.toggleAdvanced}>
          {c.showAdvanced ? 'Hide advanced options' : 'Advanced options'}
        </button>

        {c.showAdvanced && (
          <div className="control-row">
            <label htmlFor="customize-stroke-color">
              Stroke
              <input
                id="customize-stroke-color"
                type="color"
                value={c.strokeColor}
                onChange={(event) => c.setStrokeColor(event.currentTarget.value)}
              />
            </label>

            <div role="group" aria-label="Stroke width" className="stepper">
              <span className="control-label">Stroke width ({c.strokeWidth})</span>
              <div className="stepper-buttons">
                <button
                  type="button"
                  aria-label="Decrease stroke width"
                  onClick={() => c.adjustStrokeWidth(-STROKE_STEP)}
                  disabled={c.strokeWidth <= MIN_STROKE_WIDTH}
                >
                  −
                </button>
                <span className="stepper-value">{c.strokeWidth}</span>
                <button
                  type="button"
                  aria-label="Increase stroke width"
                  onClick={() => c.adjustStrokeWidth(STROKE_STEP)}
                  disabled={c.strokeWidth >= MAX_STROKE_WIDTH}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {c.customized && (
          <button type="button" className="button" onClick={c.reset}>
            Reset to original
          </button>
        )}

        <CopyDownloadActions name={icon.name} svg={c.previewSvg} />
        <UsageSnippet name={icon.name} />
      </div>
    </div>
  )
}
