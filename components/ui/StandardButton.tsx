'use client'

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type StandardButtonColor = 'primary' | 'secondary'
type StandardButtonVariant = 'solid' | 'light'

interface StandardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Brand color the button is built from. */
  color?: StandardButtonColor
  /** solid = filled dark background. light = subtle tinted background with a colored border/text. */
  variant?: StandardButtonVariant
}

const VARIANT_CLASSES: Record<StandardButtonColor, Record<StandardButtonVariant, string>> = {
  primary: {
    solid: 'bg-primary border-primary text-text-inverse hover:bg-primary-700 hover:border-primary-800',
    light: 'bg-primary-200 border-primary-800 text-primary-800 hover:text-primary-500 hover:border-primary-600 hover:bg-primary-100',
  },
  secondary: {
    solid: 'bg-secondary border-secondary text-text-inverse hover:bg-secondary-700 hover:border-secondary-800',
    light: 'bg-secondary-200 border-secondary-600 text-secondary-800 hover:text-secondary-700 hover:border-secondary-600 hover:bg-secondary-100',
  },
}

export function StandardButton({
  color = 'primary',
  variant = 'solid',
  type = 'button',
  className,
  ...props
}: StandardButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'font-subheader inline-flex items-center justify-center rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_CLASSES[color][variant],
        className
      )}
      {...props}
    />
  )
}
