import { useEffect } from 'react'
import { HeroUIProvider, twMergeConfig, cn } from '@heroui/react'

import { useTheme } from '@/hooks/useTheme'

import '@/assets/style.css'

twMergeConfig.classGroups['font-size'].push({ text: ['mini'] })

export type LayoutProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Layout(props: LayoutProps) {
  const theme = useTheme()

  useEffect(() => {
    document.body.className = cn(
      theme || 'hidden',
      'bg-background text-foreground'
    )
  }, [theme])

  return (
    <HeroUIProvider locale="ja-JP">
      <main
        className={cn('overflow-x-hidden overflow-y-auto', props.className)}
        style={props.style}
      >
        {props.children}
      </main>
    </HeroUIProvider>
  )
}
