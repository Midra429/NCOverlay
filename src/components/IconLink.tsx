import { Button } from '@nextui-org/react'

import { webext } from '@/utils/webext'

import { Tooltip } from '@/components/Tooltip'

export type IconLinkProps =
  | {
      icon: React.FC<any>
      title?: string
      href: string
    }
  | {
      icon: React.FC<any>
      title?: string
      onPress: () => void
    }

export const IconLink: React.FC<IconLinkProps> = (props) => (
  <Tooltip
    content={
      props.title || ('href' in props && new URL(props.href).pathname.slice(1))
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
      <props.icon className="size-5 text-foreground-700" />
    </Button>
  </Tooltip>
)
