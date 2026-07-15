'use client'

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { cn } from '@/lib/utils'

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        'h-9 w-full min-w-0 rounded-3xl border border-border bg-surface-1 px-3 py-1 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

function ComboboxPopup({ className, ...props }: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPrimitive.Popup
      data-slot="combobox-popup"
      className={cn(
        'z-50 max-h-64 w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-border bg-surface-1 p-1 shadow-lg outline-none',
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        'flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-text-primary outline-none data-[highlighted]:bg-accent/10 data-[selected]:font-medium',
        className
      )}
      {...props}
    />
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('px-3 py-2 text-sm text-text-muted', className)}
      {...props}
    />
  )
}

function ComboboxStatus({ className, ...props }: ComboboxPrimitive.Status.Props) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn('px-3 py-1.5 text-xs text-text-muted', className)}
      {...props}
    />
  )
}

export const Combobox = {
  Root: ComboboxPrimitive.Root,
  Portal: ComboboxPrimitive.Portal,
  Positioner: ComboboxPrimitive.Positioner,
  List: ComboboxPrimitive.List,
  Input: ComboboxInput,
  Popup: ComboboxPopup,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Status: ComboboxStatus,
}
