import type { ButtonProps } from '@nextui-org/react'
import type { PopconfirmProps } from '@/components/popconfirm'

import { Button } from '@nextui-org/react'
import { Popconfirm } from '@/components/popconfirm'

export const ItemButton: React.FC<{
  title: React.ReactNode
  description?: React.ReactNode
  button: {
    variant?: ButtonProps['variant']
    color?: ButtonProps['color']
    text: React.ReactNode
    onPress: () => void
  }
  confirm?: {
    placement?: PopconfirmProps['placement']
    title: React.ReactNode
    description?: React.ReactNode
  }
}> = (props) => {
  const button = (
    <Button
      className="min-w-24 shrink-0"
      size="sm"
      variant={props.button.variant}
      color={props.button.color}
      onPress={props.button.onPress}
    >
      {props.button.text}
    </Button>
  )

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="line-clamp-1 text-small">{props.title}</span>
        {props.description && (
          <span className="line-clamp-2 text-tiny text-foreground-400">
            {props.description}
          </span>
        )}
      </div>

      {props.confirm ? (
        <Popconfirm
          placement={props.confirm.placement}
          title={props.confirm.title}
          description={props.confirm.description}
          okColor={props.button.color}
          onOk={props.button.onPress}
        >
          {button}
        </Popconfirm>
      ) : (
        button
      )}
    </div>
  )
}
