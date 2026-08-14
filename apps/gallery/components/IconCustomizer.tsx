'use client'

import { useMemo, useState } from 'react'
import { applyCustomization } from '@/lib/customize-svg'
import { CopyDownloadActions } from './CopyDownloadActions'

interface IconCustomizerProps {
  name: string
  svg: string
}

const DEFAULT_SIZE = 128
const MIN_SIZE = 16
const MAX_SIZE = 512
const PREVIEW_MAX_PX = 200

const DEFAULT_COLOR = '#000000'
const DEFAULT_STROKE_COLOR = '#000000'
const DEFAULT_STROKE_WIDTH = 2
const MIN_STROKE_WIDTH = 0
const MAX_STROKE_WIDTH = 10
const STROKE_STEP = 0.5

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

export function IconCustomizer({ name, svg }: IconCustomizerProps) {
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR)
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customized, setCustomized] = useState(false)

  const previewSvg = useMemo(() => {
    if (!customized) return svg
    return applyCustomization(svg, { size, color, strokeColor, strokeWidth })
  }, [svg, customized, size, color, strokeColor, strokeWidth])

  function change<T>(setter: (value: T) => void, value: T) {
    setCustomized(true)
    setter(value)
  }

  function reset() {
    setSize(DEFAULT_SIZE)
    setColor(DEFAULT_COLOR)
    setStrokeColor(DEFAULT_STROKE_COLOR)
    setStrokeWidth(DEFAULT_STROKE_WIDTH)
    setCustomized(false)
  }

  function adjustStrokeWidth(delta: number) {
    const next = Math.min(MAX_STROKE_WIDTH, Math.max(MIN_STROKE_WIDTH, strokeWidth + delta))
    change(setStrokeWidth, next)
  }

  const previewPx = Math.min(customized ? size : 96, PREVIEW_MAX_PX)

  return (
    <div className="customizer">
      <div
        className="detail-glyph"
        style={{ width: previewPx, height: previewPx }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />

      <div className="customize-controls">
        <label className="size-control" htmlFor="customize-size">
          Size ({size}px)
          <input
            id="customize-size"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            onChange={(event) => change(setSize, Number(event.currentTarget.value))}
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
                  aria-pressed={color === swatch.hex}
                  className={`swatch${color === swatch.hex ? ' swatch-selected' : ''}`}
                  style={{ background: swatch.hex }}
                  onClick={() => change(setColor, swatch.hex)}
                />
              ))}
              <input
                aria-label="Color"
                type="color"
                value={color}
                onChange={(event) => change(setColor, event.currentTarget.value)}
              />
            </div>
          </div>
        </div>

        <button type="button" className="button" onClick={() => setShowAdvanced((v) => !v)}>
          {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
        </button>

        {showAdvanced && (
          <div className="control-row">
            <label htmlFor="customize-stroke-color">
              Stroke
              <input
                id="customize-stroke-color"
                type="color"
                value={strokeColor}
                onChange={(event) => change(setStrokeColor, event.currentTarget.value)}
              />
            </label>

            <div role="group" aria-label="Stroke width" className="stepper">
              <span className="control-label">Stroke width ({strokeWidth})</span>
              <div className="stepper-buttons">
                <button
                  type="button"
                  aria-label="Decrease stroke width"
                  onClick={() => adjustStrokeWidth(-STROKE_STEP)}
                  disabled={strokeWidth <= MIN_STROKE_WIDTH}
                >
                  −
                </button>
                <span className="stepper-value">{strokeWidth}</span>
                <button
                  type="button"
                  aria-label="Increase stroke width"
                  onClick={() => adjustStrokeWidth(STROKE_STEP)}
                  disabled={strokeWidth >= MAX_STROKE_WIDTH}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {customized && (
          <button type="button" className="button" onClick={reset}>
            Reset to original
          </button>
        )}
      </div>

      <CopyDownloadActions name={name} svg={previewSvg} />
    </div>
  )
}
