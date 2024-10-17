import type {
  SlotsToClasses,
  SelectProps as NextUISelectProps,
  SelectSlots,
} from '@nextui-org/react'

import { useMemo } from 'react'
import {
  Select as NextUISelect,
  SelectItem as NextUISelectItem,
  SelectSection as NextUISelectSection,
  tv,
} from '@nextui-org/react'

export type SelectProps = Omit<NextUISelectProps, 'size'> & {
  size?: NextUISelectProps['size'] | 'mini'
}

const select = tv({
  slots: {
    base: '',
    label: '',
    mainWrapper: '',
    trigger: 'border-1 border-divider shadow-none',
    innerWrapper: [
      '[&:has(>svg)]:gap-2',
      '[&>svg]:shrink-0',
      '[&>svg]:text-foreground-500',
      '[&>svg]:dark:text-foreground-600',
    ],
    selectorIcon: '',
    spinner: '',
    value: '',
    listboxWrapper: '',
    listbox: '',
    popoverContent: 'border-1 border-foreground-100',
    helperWrapper: '',
    description: [
      'whitespace-pre-wrap text-tiny',
      'text-foreground-500 dark:text-foreground-600',
    ],
    errorMessage: '',
  } satisfies SlotsToClasses<SelectSlots>,
  variants: {
    size: {
      sm: {
        base: 'items-center justify-between gap-5',
        label: 'shrink-0 p-0 text-small',
        mainWrapper: 'transition-colors',
        value: 'flex flex-row items-center justify-center gap-2',
      },
      md: '',
      lg: '',
      mini: {
        label: 'hidden',
        trigger: 'h-6 min-h-6 px-1.5',
        innerWrapper: '!pt-0 [&:has(>svg)]:gap-1.5',
        selectorIcon: 'end-1.5',
        value: 'text-mini',
        listbox: 'p-0',
        popoverContent: 'rounded-lg',
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export const Select: React.FC<SelectProps> = (props) => {
  const classNames = useMemo(() => {
    const slots = select({ size: props.size })
    const slotKeys = Object.keys(slots) as SelectSlots[]

    return Object.fromEntries(
      slotKeys.map((key) => [
        key,
        slots[key]({ class: props.classNames?.[key] }),
      ])
    ) as NextUISelectProps['classNames']
  }, [props.size])

  return (
    <NextUISelect
      {...props}
      classNames={classNames}
      size={props.size === 'mini' ? 'sm' : props.size}
      variant="faded"
      listboxProps={{
        variant: 'flat',
        ...props.listboxProps,
      }}
    />
  )
}

export const SelectSection = NextUISelectSection

export const SelectItem = NextUISelectItem
