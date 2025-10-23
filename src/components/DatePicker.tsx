import type { DatePickerProps as HeroUIDatePickerProps } from '@heroui/react'

import { DatePicker as HeroUIDatePicker, cn } from '@heroui/react'

export interface DatePickerProps extends HeroUIDatePickerProps {}

export function DatePicker(props: DatePickerProps) {
  return (
    <HeroUIDatePicker
      size="sm"
      variant="faded"
      // granularity="second"
      hideTimeZone
      showMonthAndYearPickers
      labelPlacement="outside-left"
      {...props}
      className={cn(
        'justify-between pb-0!',

        // label
        '**:data-[slot="label"]:text-small!',

        // inputWrapper
        '**:data-[slot="input-wrapper"]:max-w-64',
        '**:data-[slot="input-wrapper"]:border-1',
        '**:data-[slot="input-wrapper"]:border-divider',
        '**:data-[slot="input-wrapper"]:shadow-none!',
        '**:data-[slot="input-wrapper"]:transition-colors',
        '[&_[data-slot="input-wrapper"]:has([data-open="true"])]:border-primary',
        '[&_[data-slot="input-wrapper"]:has([data-open="true"])]:bg-primary/15',
        'dark:[&_[data-slot="input-wrapper"]:has([data-open="true"])]:bg-primary/20',

        // innerWrapper
        '**:data-[slot="inner-wrapper"]:text-foreground-500',
        'dark:**:data-[slot="inner-wrapper"]:text-foreground-600',

        // segment
        // '**:data-[slot="segment"]:mx-[-0.5px]',
        // '**:data-[slot="segment"]:px-0',
        // '[&_[data-slot="segment"][data-type="hour"]]:ml-0.5',

        // selectorIcon
        '**:data-[slot="selector-icon"]:size-4',

        // errorMessage
        '**:data-[slot="error-message"]:hidden',
        props.className
      )}
      popoverProps={{
        classNames: {
          content: cn('border-divider border-1'),
        },
        ...props.popoverProps,
      }}
      calendarProps={{
        className: cn(
          // pickerWrapper
          '**:data-[slot="picker-wrapper"]:flex-row-reverse',

          // header
          '**:data-[slot="header"]:border-1',
          '**:data-[slot="header"]:border-divider',
          '**:data-[slot="header"]:hover:bg-default-200',
          '**:data-[slot="header"]:hover:border-default-400',

          // title
          '**:data-[slot="title"]:text-foreground',

          // inputWrapper
          '**:data-[slot="input-wrapper"]:border-1',
          '**:data-[slot="input-wrapper"]:border-divider',
          '**:data-[slot="input-wrapper"]:shadow-none!',

          // helperWrapper
          '**:data-[slot="helper-wrapper"]:hidden!'
        ),
        ...props.calendarProps,
      }}
      timeInputProps={{
        className: cn('pb-4!'),
      }}
    />
  )
}
