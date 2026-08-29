import { DarkModeToggle } from './DarkModeToggle'

/**
 * Single fixed-position anchor for every floating bottom-right control —
 * mirrors jatinrao/portfolio-jatin's FloatingControls: one place owns the
 * group's position, so each control below is just a plain trigger rather
 * than carrying its own `position: fixed`. The toolbar itself carries no
 * surface of its own — each GlassButton is already a complete glass
 * surface, so a second glass background here would double up the border.
 */
export function FloatingControls() {
  return (
    <div className="floating-controls">
      <div className="glass-toolbar" role="toolbar" aria-label="Site controls">
        <DarkModeToggle />
      </div>
    </div>
  )
}
