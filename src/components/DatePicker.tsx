import type { DatePickerProps as NextUIDatePickerProps } from '@nextui-org/react'

import { DatePicker as NextUIDatePicker, cn } from '@nextui-org/react'

export type DatePickerProps = NextUIDatePickerProps

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  return (
    <NextUIDatePicker
      size="sm"
      variant="faded"
      // granularity="second"
      hideTimeZone
      showMonthAndYearPickers
      labelPlacement="outside-left"
      {...props}
      className={cn(
        'justify-between !pb-0',

        // label
        '[&_[data-slot="label"]]:!text-small',

        // inputWrapper
        '[&_[data-slot="input-wrapper"]]:max-w-64',
        '[&_[data-slot="input-wrapper"]]:border-1',
        '[&_[data-slot="input-wrapper"]]:border-divider',
        '[&_[data-slot="input-wrapper"]]:!shadow-none',
        '[&_[data-slot="input-wrapper"]]:transition-colors',
        '[&_[data-slot="input-wrapper"]:has([data-open="true"])]:border-primary',
        '[&_[data-slot="input-wrapper"]:has([data-open="true"])]:bg-primary/15',
        'dark:[&_[data-slot="input-wrapper"]:has([data-open="true"])]:bg-primary/20',

        // innerWrapper
        '[&_[data-slot="inner-wrapper"]]:text-foreground-500',
        '[&_[data-slot="inner-wrapper"]]:dark:text-foreground-600',

        // segment
        '[&_[data-slot="segment"]]:mx-[-0.5px]',
        '[&_[data-slot="segment"]]:px-0',
        '[&_[data-slot="segment"][data-type="hour"]]:ml-0.5',

        // selectorIcon
        '[&_[data-slot="selector-icon"]]:size-4',

        // errorMessage
        '[&_[data-slot="error-message"]]:hidden',
        props.className
      )}
      popoverProps={{
        classNames: {
          content: cn('border-1 border-divider'),
        },
        ...props.popoverProps,
      }}
      calendarProps={{
        className: cn(
          // pickerWrapper
          '[&_[data-slot="picker-wrapper"]]:flex-row-reverse',

          // header
          '[&_[data-slot="header"]]:border-1',
          '[&_[data-slot="header"]]:border-divider',
          '[&_[data-slot="header"]:hover]:bg-default-200',
          '[&_[data-slot="header"]:hover]:border-default-400',

          // title
          '[&_[data-slot="title"]]:text-foreground',

          // inputWrapper
          '[&_[data-slot="input-wrapper"]]:border-1',
          '[&_[data-slot="input-wrapper"]]:border-divider',
          '[&_[data-slot="input-wrapper"]]:!shadow-none',

          // helperWrapper
          '[&_[data-slot="helper-wrapper"]]:!hidden'
        ),
        ...props.calendarProps,
      }}
      timeInputProps={{
        className: cn('!pb-4'),
      }}
    />
  )
}
