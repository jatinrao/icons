'use client'

import { useId } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/**
 * Apple visionOS-style "Liquid Glass" button: a blurred, turbulence-distorted
 * refraction layer under a tint and an inner rim highlight. Ported from
 * jatinrao/portfolio-jatin's GlassButton atom, minus its WebGL renderer path
 * (this app has exactly one floating control — not worth the extra engine).
 */
export function GlassButton({ children, className = '', type = 'button', ...rest }: GlassButtonProps) {
  // Unique id so multiple glass buttons on the same page don't collide on the SVG filter reference.
  const filterId = `glass-distortion-${useId().replace(/:/g, '')}`

  return (
    <button type={type} className={`glass-button ${className}`} {...rest}>
      <span
        aria-hidden
        className="glass-button-layer glass-button-blur"
        style={{ backdropFilter: `blur(3px) url(#${filterId})`, WebkitBackdropFilter: 'blur(3px)' }}
      />
      <span aria-hidden className="glass-button-layer glass-button-tint" />
      <span aria-hidden className="glass-button-layer glass-button-rim" />
      <span className="glass-button-content">{children}</span>

      <svg aria-hidden className="glass-button-filter-svg">
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves={1} seed={5} result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
            <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
            <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale={5}
            specularConstant={1}
            specularExponent={100}
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x={-200} y={-200} z={300} />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale={150} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </button>
  )
}
