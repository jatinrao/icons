import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from '../Header'

describe('Header', () => {
  it('renders the brand as a link back to the homepage', () => {
    render(<Header />)
    const brand = screen.getByRole('link', { name: /home$/i })
    expect(brand).toHaveAttribute('href', '/')
  })

  it('wraps the brand in an <h1> only on the homepage', () => {
    const { rerender } = render(<Header />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()

    rerender(<Header isHomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('links to GitHub and npm', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/jatinrao/icons',
    )
    expect(screen.getByRole('link', { name: 'npm' })).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/@web-portfolio/icons',
    )
  })

  it('surfaces the icon-request flow as a "Raise Issue" button', () => {
    render(<Header />)
    const raiseIssue = screen.getByRole('link', { name: 'Raise Issue' })
    expect(raiseIssue).toHaveAttribute('href', expect.stringContaining('github.com/jatinrao/icons/issues/new'))
  })
})
