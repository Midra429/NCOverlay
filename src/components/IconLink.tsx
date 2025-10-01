import { Button } from '@heroui/react'

import { webext } from '@/utils/webext'

import { Tooltip } from '@/components/Tooltip'

export type IconLinkProps = {
  Icon: (props: React.ComponentProps<'svg'>) => React.ReactNode
  title?: string
} & (
  | {
      href: string
    }
  | {
      onPress: () => void
    }
)

export function IconLink({ Icon, title, ...props }: IconLinkProps) {
  return (
    <Tooltip
      content={
        title || ('href' in props && new URL(props.href).pathname.slice(1))
      }
    >
      <Button
        size="sm"
        radius="full"
        variant="light"
        isIconOnly
        onPress={
          'onPress' in props
            ? props.onPress
            : () => webext.tabs.create({ url: props.href })
        }
      >
        <Icon className="text-foreground-700 size-5" />
      </Button>
    </Tooltip>
  )
}
