import type { ModalProps as HeroUIModalProps } from '@heroui/react'

import { useEffect } from 'react'
import {
  Button,
  Modal as HeroUIModal,
  ModalBody as HeroUIModalBody,
  ModalContent as HeroUIModalContent,
  ModalFooter as HeroUIModalFooter,
  ModalHeader as HeroUIModalHeader,
} from '@heroui/react'
import { XIcon } from 'lucide-react'

export interface ModalProps {
  fullWidth?: boolean
  disableAnimation?: boolean

  isOpen?: HeroUIModalProps['isOpen']
  defaultOpen?: HeroUIModalProps['defaultOpen']
  onOpenChange?: HeroUIModalProps['onOpenChange']
  onOpen?: () => void
  onClose?: () => void

  okText?: string
  okIcon?: React.ReactNode
  isOkDisabled?: boolean
  onOk?: () => void | Promise<void>

  cancelText?: string
  cancelIcon?: React.ReactNode

  header?: React.ReactNode
  headerEndContent?: React.ReactNode

  footer?: React.ReactNode
  footerStartContent?: React.ReactNode

  children: React.ReactNode
}

export function Modal(props: ModalProps) {
  useEffect(() => {
    if (props.isOpen || props.defaultOpen) {
      props.onOpen?.()
    }
  }, [props.isOpen])

  return (
    <HeroUIModal
      classNames={{
        wrapper: 'justify-end',
        base: !props.fullWidth && 'max-w-[370px]',
        header: 'border-foreground-200 border-b-1 p-2 text-medium',
        body: 'p-0',
        footer: 'border-foreground-200 border-t-1 p-2',
      }}
      size="full"
      hideCloseButton
      isKeyboardDismissDisabled={true}
      disableAnimation={props.disableAnimation}
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={(isOpen) => {
        props.onOpenChange?.(isOpen)

        if (isOpen) {
          props.onOpen?.()
        }
      }}
      onClose={props.onClose}
    >
      <HeroUIModalContent>
        {(onClose) => (
          <>
            {props.header && (
              <HeroUIModalHeader className="flex flex-row justify-between">
                <div className="flex min-h-8 flex-row items-center">
                  {props.header}
                </div>

                <div className="flex h-full shrink-0 flex-row gap-2 font-normal">
                  {props.headerEndContent}
                </div>
              </HeroUIModalHeader>
            )}

            <HeroUIModalBody className="max-h-full gap-0 overflow-auto bg-background">
              {props.children}
            </HeroUIModalBody>

            {props.footer !== false && (
              <HeroUIModalFooter className="justify-between">
                <div className="flex flex-row gap-2">
                  {props.footerStartContent}
                </div>

                <div className="flex flex-row gap-2">
                  {props.footer ?? (
                    <>
                      <Button
                        size="sm"
                        variant="flat"
                        color="default"
                        startContent={
                          props.cancelIcon || <XIcon className="size-4" />
                        }
                        onPress={onClose}
                      >
                        {props.cancelText || 'キャンセル'}
                      </Button>

                      {props.onOk && (
                        <Button
                          size="sm"
                          color="primary"
                          isDisabled={props.isOkDisabled}
                          startContent={props.okIcon}
                          onPress={async () => {
                            await props.onOk?.()

                            onClose()
                          }}
                        >
                          {props.okText || 'OK'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </HeroUIModalFooter>
            )}
          </>
        )}
      </HeroUIModalContent>
    </HeroUIModal>
  )
}
