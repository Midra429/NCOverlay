import { Tooltip, Button } from '@nextui-org/react'
import { webext } from '@/utils/webext'

export const IconLink: React.FC<
  {
    icon: React.FC<any>
    title?: string
  } & (
    | {
        href: string
      }
    | {
        onPress: () => void
      }
  )
> = (props) => (
  <Tooltip
    classNames={{
      base: 'pointer-events-none',
    }}
    placement="top-end"
    size="sm"
    radius="sm"
    color="foreground"
    showArrow
    closeDelay={0}
    content={
      props.title || ('href' in props && new URL(props.href).pathname.slice(1))
    }
  >
    <Button
      className="text-foreground"
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
      <props.icon className="size-5 text-foreground-700" title="" />
    </Button>
  </Tooltip>
)
