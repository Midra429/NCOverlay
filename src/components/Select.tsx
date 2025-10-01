import type {
  SlotsToClasses,
  SelectProps as HeroUISelectProps,
  SelectSlots,
} from '@heroui/react'

import {
  Select as HeroUISelect,
  SelectItem as HeroUISelectItem,
  SelectSection as HeroUISelectSection,
  tv,
} from '@heroui/react'

export type SelectProps = Omit<HeroUISelectProps, 'size'> & {
  size?: HeroUISelectProps['size'] | 'mini'
}

const select = tv({
  slots: {
    base: '',
    label: '',
    mainWrapper: '',
    trigger: 'border-divider border-1 shadow-none',
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
    popoverContent: 'border-foreground-100 border-1',
    helperWrapper: '',
    description: [
      'text-tiny whitespace-pre-wrap',
      'text-foreground-500 dark:text-foreground-600',
    ],
    errorMessage: '',
  } satisfies SlotsToClasses<SelectSlots>,
  variants: {
    size: {
      sm: {
        base: 'items-center justify-between gap-5',
        label: 'text-small shrink-0 p-0',
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

export function Select(props: SelectProps) {
  const slots = select({ size: props.size })
  const slotKeys = Object.keys(slots) as (keyof typeof slots)[]
  const classNames = Object.fromEntries(
    slotKeys.map((key) => [key, slots[key]({ class: props.classNames?.[key] })])
  ) as HeroUISelectProps['classNames']

  return (
    <HeroUISelect
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

export const SelectSection = HeroUISelectSection

export const SelectItem = HeroUISelectItem
