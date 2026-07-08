'use client'

import { Tabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'

interface Tab {
  value: string
  label: string
  icon?: React.ReactNode
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (value: string) => void
  className?: string
}

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  return (
    <Tabs.Root
      data-slot="tab-bar"
      value={activeTab}
      onValueChange={(value) => onTabChange(value as string)}
      className={className}
    >
      <Tabs.List className="flex border-b border-border">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all border-b-2 cursor-pointer active:scale-[0.97] active:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40',
              'text-text-muted border-transparent hover:text-text-secondary',
              'data-active:text-text-primary data-active:border-text-primary'
            )}
          >
            {tab.icon}
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
