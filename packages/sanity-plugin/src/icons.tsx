import { forwardRef, type SVGProps } from 'react'

/**
 * Inlined rather than imported from `@sanity/icons`. That package dropped its
 * root barrel export in v5 — `import {ImageIcon} from '@sanity/icons'` stops
 * resolving entirely — and Sanity Studio v6 already pulls `@sanity/icons`
 * ^5.2 as its own dependency, so any Studio on the current major would fail
 * to load this plugin. These four are visually identical to their
 * `@sanity/icons` counterparts (same viewBox, path data and stroke), just
 * copied in so this plugin has no dependency on which major is installed.
 */
function iconPath(d: string) {
  return forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function IconSvg(props, ref) {
    return (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={ref}
      >
        <path d={d} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    )
  })
}

export const ImageIcon = iconPath(
  'M5.5 15.5L8.79289 12.2071C9.18342 11.8166 9.81658 11.8166 10.2071 12.2071L12.8867 14.8867C13.2386 15.2386 13.7957 15.2782 14.1938 14.9796L15.1192 14.2856C15.3601 14.1049 15.6696 14.0424 15.9618 14.1154L19.5 15M5.5 6.5H19.5V18.5H5.5V6.5ZM15.5 10.5C15.5 11.0523 15.0523 11.5 14.5 11.5C13.9477 11.5 13.5 11.0523 13.5 10.5C13.5 9.94772 13.9477 9.5 14.5 9.5C15.0523 9.5 15.5 9.94772 15.5 10.5Z',
)

export const SearchIcon = iconPath(
  'M15.0355 15.0355L20 20M16.5 11.5C16.5 14.2614 14.2614 16.5 11.5 16.5C8.73858 16.5 6.5 14.2614 6.5 11.5C6.5 8.73858 8.73858 6.5 11.5 6.5C14.2614 6.5 16.5 8.73858 16.5 11.5Z',
)

export const TrashIcon = iconPath(
  'M5 6.5H20M10 6.5V4.5C10 3.94772 10.4477 3.5 11 3.5H14C14.5523 3.5 15 3.94772 15 4.5V6.5M12.5 9V17M15.5 9L15 17M9.5 9L10 17M18.5 6.5L17.571 18.5767C17.5309 19.0977 17.0965 19.5 16.574 19.5H8.42603C7.90349 19.5 7.46905 19.0977 7.42898 18.5767L6.5 6.5H18.5Z',
)

export const WarningOutlineIcon = iconPath(
  'M12.5 9V13M12.5 16V14.5M14.2239 5.43058L20.727 16.486C21.5113 17.8192 20.55 19.5 19.0032 19.5H5.99683C4.45 19.5 3.48869 17.8192 4.27297 16.486L10.7761 5.43058C11.5494 4.11596 13.4506 4.11596 14.2239 5.43058Z',
)
