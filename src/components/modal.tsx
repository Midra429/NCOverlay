import type { ModalProps as NextUIModalProps } from '@nextui-org/react'

import { useCallback } from 'react'
import {
  Button,
  Modal as NextUIModal,
  ModalContent as NextUIModalContent,
  ModalHeader as NextUIModalHeader,
  ModalBody as NextUIModalBody,
  ModalFooter as NextUIModalFooter,
} from '@nextui-org/react'

export type ModalProps = {
  isOpen: NextUIModalProps['isOpen']
  onOpenChange: NextUIModalProps['onOpenChange']
  onClose?: NextUIModalProps['onClose']
  okText?: string
  cancelText?: string
  okIcon?: React.ReactNode
  cancelIcon?: React.ReactNode
  onOk: () => void
  header: React.ReactNode
  headerEndContent?: React.ReactNode
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = (props) => {
  return (
    <NextUIModal
      classNames={{
        wrapper: 'justify-end',
        base: 'max-w-[370px]',
        header: 'border-b-1 border-foreground-200 p-2 text-medium',
        body: 'p-0',
        footer: 'border-t-1 border-foreground-200 p-2',
      }}
      size="full"
      hideCloseButton
      isKeyboardDismissDisabled={true}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      onClose={props.onClose}
    >
      <NextUIModalContent>
        {(onClose) => {
          const onPressOk = useCallback(() => {
            props.onOk()
            onClose()
          }, [props.onOk])

          return (
            <>
              <NextUIModalHeader className="flex flex-row justify-between">
                {props.header}
                {props.headerEndContent}
              </NextUIModalHeader>

              <NextUIModalBody className="max-h-full gap-0 overflow-auto">
                {props.children}
              </NextUIModalBody>

              <NextUIModalFooter>
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  startContent={props.cancelIcon}
                  onPress={onClose}
                >
                  {props.cancelText || 'キャンセル'}
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  startContent={props.okIcon}
                  onPress={onPressOk}
                >
                  {props.okText || 'OK'}
                </Button>
              </NextUIModalFooter>
            </>
          )
        }}
      </NextUIModalContent>
    </NextUIModal>
  )
}
