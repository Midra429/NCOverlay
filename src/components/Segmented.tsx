import type { TabsProps } from "@heroui/react"

import { Tabs, Tab, cn, tv } from "@heroui/react"

export type SegmentedProps = {
  className?: TabsProps['className']

  items: SegmentedItem[]
  size?: TabsProps['size']
  radius?: TabsProps['radius']
  fullWidth?: TabsProps['fullWidth']
  label?: string
  selectedKey?: string
  defaultSelectedKey?: string
  onSelectionChange?: (key: string) => void
}

export type SegmentedItem = {
  key: string | number
  children: React.ReactNode
  startContent?: React.ReactNode
}

const segmentedLabel = tv({
  base: 'my-1',
  variants: {
    size: {
      sm: 'text-small',
      md: 'text-medium',
      lg: 'text-large',
    },
  },
})

export const Segmented: React.FC<SegmentedProps> = (props) => {
  return (
    <div className={cn('flex flex-col gap-1', props.className)}>
      {props.label && (
        <span className={segmentedLabel({ size: props.size })}>
          {props.label}
        </span>
      )}

      <Tabs
        color="primary"
        size={props.size}
        radius={props.radius}
        fullWidth={props.fullWidth}
        selectedKey={props.selectedKey}
        defaultSelectedKey={props.defaultSelectedKey}
        onSelectionChange={
          props.onSelectionChange as TabsProps['onSelectionChange']
        }
      >
        {props.items.map(({ key, children, startContent }) => (
          <Tab
            key={key}
            title={
              startContent ? (
                <div className="flex flex-row items-center gap-1">
                  {startContent}
                  <span>{children}</span>
                </div>
              ) : (
                children
              )
            }
          />
        ))}
      </Tabs>
    </div>
  )
}
