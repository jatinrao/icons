import { useMemo, useState } from 'react'
import { applyCustomization } from './customize-svg'

export const DEFAULT_SIZE = 128
export const MIN_SIZE = 16
export const MAX_SIZE = 512

const DEFAULT_COLOR = '#000000'
const DEFAULT_STROKE_COLOR = '#000000'
const DEFAULT_STROKE_WIDTH = 2
export const MIN_STROKE_WIDTH = 0
export const MAX_STROKE_WIDTH = 10
export const STROKE_STEP = 0.5

/**
 * Owns all customization state for one icon's preview/export, shared by both
 * the full detail page and the intercepted-route modal so they can't drift
 * out of sync with each other.
 */
export function useIconCustomization(svg: string) {
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

  return {
    size,
    color,
    strokeColor,
    strokeWidth,
    showAdvanced,
    customized,
    previewSvg,
    setSize: (value: number) => change(setSize, value),
    setColor: (value: string) => change(setColor, value),
    setStrokeColor: (value: string) => change(setStrokeColor, value),
    adjustStrokeWidth,
    toggleAdvanced: () => setShowAdvanced((v) => !v),
    reset,
  }
}
