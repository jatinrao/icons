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

  const previewPx = Math.min(customized ? size : 96, PREVIEW_MAX_PX)

  return (
    <div className="customizer">
      <div
        className="detail-glyph"
        style={{ width: previewPx, height: previewPx }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />

      <div className="customize-controls">
        <div className="control-row">
          <label htmlFor="customize-size">
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

          <label htmlFor="customize-color">
            Color
            <input
              id="customize-color"
              type="color"
              value={color}
              onChange={(event) => change(setColor, event.currentTarget.value)}
            />
          </label>
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

            <label htmlFor="customize-stroke-width">
              Stroke width
              <input
                id="customize-stroke-width"
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={strokeWidth}
                onChange={(event) => change(setStrokeWidth, Number(event.currentTarget.value))}
              />
            </label>
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
