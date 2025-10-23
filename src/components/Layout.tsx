import { useEffect } from 'react'
import { HeroUIProvider, twMergeConfig, cn } from '@heroui/react'
import { ToastProvider } from '@heroui/toast'

import { useTheme } from '@/hooks/useTheme'

import '@/assets/style.css'

twMergeConfig.classGroups['font-size'].push({ text: ['mini'] })

export interface LayoutProps {
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
      <ToastProvider
        placement="top-center"
        toastProps={{
          size: 'sm',
          timeout: 3000,
        }}
      />

      <main
        className={cn('overflow-x-hidden overflow-y-auto', props.className)}
        style={props.style}
      >
        {props.children}
      </main>
    </HeroUIProvider>
  )
}
