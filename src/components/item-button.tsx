import type { ButtonProps } from '@nextui-org/react'
import type { PopconfirmProps } from '@/components/popconfirm'

import { Button, cn } from '@nextui-org/react'

import { ItemLabel } from '@/components/label'
import { Popconfirm } from '@/components/popconfirm'

export const ItemButton: React.FC<{
  title: React.ReactNode
  description?: React.ReactNode
  button: {
    variant?: ButtonProps['variant']
    color?: ButtonProps['color']
    startContent?: ButtonProps['startContent']
    endContent?: ButtonProps['endContent']
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
      className={cn(
        'min-w-24 shrink-0',
        props.button.variant === 'flat' &&
          props.button.color === 'default' &&
          'text-foreground'
      )}
      size="sm"
      variant={props.button.variant}
      color={props.button.color}
      startContent={props.button.startContent}
      endContent={props.button.endContent}
      onPress={props.button.onPress}
    >
      {props.button.text}
    </Button>
  )

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <ItemLabel title={props.title} description={props.description} />

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
