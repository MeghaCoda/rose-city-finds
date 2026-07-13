'use client'

import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { cn } from '@/lib/utils'

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  value,
  label,
  className,
  ...props
}: Radio.Root.Props & { label: React.ReactNode }) {
  return (
    <label
      data-slot="radio-group-item"
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary transition-colors has-data-checked:border-primary has-data-checked:bg-primary-subtle',
        className
      )}
    >
      <Radio.Root
        value={value}
        className="flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-surface-1 outline-none data-checked:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        {...props}
      >
        <Radio.Indicator className="size-2 rounded-full bg-primary" />
      </Radio.Root>
      {label}
    </label>
  )
}

export { RadioGroup, RadioGroupItem }
