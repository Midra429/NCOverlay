import type { PopoverProps, ButtonProps } from '@nextui-org/react'

import { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  cn,
  tv,
} from '@nextui-org/react'
import { InfoIcon } from 'lucide-react'

export type PopconfirmProps = {
  children: React.ReactElement

  placement?: PopoverProps['placement']
  icon?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode

  okColor?: ButtonProps['color']
  okText?: React.ReactNode
  onOk: () => void | Promise<void>

  cancelColor?: ButtonProps['color']
  cancelText?: React.ReactNode
  onCancel?: () => void | Promise<void>
}

const popoverIcon = tv({
  defaultVariants: {
    color: 'default',
  },
  variants: {
    color: {
      default: 'fill-blue-600/10 text-blue-600',
      primary: 'fill-primary/10 text-primary',
      secondary: 'fill-secondary/10 text-secondary',
      success: 'fill-success/10 text-success',
      warning: 'fill-warning/10 text-warning',
      danger: 'fill-danger/10 text-danger',
    },
  },
})

export const Popconfirm: React.FC<PopconfirmProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isOkLoading, setIsOkLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)

  return (
    <Popover
      classNames={{
        content: cn(
          'flex flex-row items-start gap-1.5 p-2.5',
          'border-1 border-foreground-300/80'
        ),
      }}
      placement={props.placement}
      backdrop="opaque"
      showArrow
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <PopoverTrigger>{props.children}</PopoverTrigger>

      <PopoverContent>
        <div className="flex h-5 flex-shrink-0 items-center">
          {props.icon || (
            <InfoIcon
              className={popoverIcon({ color: props.okColor })}
              size={16}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-semibold">{props.title}</span>

          <span className="text-tiny text-default-500">
            {props.description}
          </span>

          <div className="ml-auto mt-1.5 flex flex-row gap-2">
            <Button
              className="h-7"
              size="sm"
              color={props.cancelColor || 'default'}
              variant="flat"
              isLoading={isCancelLoading}
              onPress={async () => {
                if (props.onCancel) {
                  const response = props.onCancel()

                  if (response instanceof Promise) {
                    setIsCancelLoading(true)
                    await response
                    setIsCancelLoading(false)
                  }
                }

                setIsOpen(false)
              }}
            >
              {props.cancelText || 'キャンセル'}
            </Button>

            <Button
              className="h-7"
              size="sm"
              color={props.okColor || 'primary'}
              variant="solid"
              isLoading={isOkLoading}
              onPress={async () => {
                const response = props.onOk()

                if (response instanceof Promise) {
                  setIsOkLoading(true)
                  await response
                  setIsOkLoading(false)
                }

                setIsOpen(false)
              }}
            >
              {props.okText || 'OK'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
