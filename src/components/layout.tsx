import type { Writable } from 'utility-types'

import { useEffect } from 'react'
import { NextUIProvider, twMergeConfig, cn } from '@nextui-org/react'

import { useTheme } from '@/hooks/useTheme'

import '@/assets/style.css'

const classGroups = twMergeConfig.classGroups as Record<
  string,
  Writable<NonNullable<(typeof twMergeConfig)['classGroups']>[string]>
>

classGroups!['font-size'].push({ text: ['mini'] })

export type LayoutProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const theme = useTheme()

  useEffect(() => {
    document.body.className = cn(
      theme || 'hidden',
      'bg-background text-foreground'
    )
  }, [theme])

  return (
    <NextUIProvider locale="ja-JP">
      <main
        className={cn('overflow-y-auto overflow-x-hidden', props.className)}
        style={props.style}
      >
        {props.children}
      </main>
    </NextUIProvider>
  )
}
