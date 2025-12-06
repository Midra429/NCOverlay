import type { AccordionItemProps } from '@heroui/react'

import {
  Accordion,
  AccordionItem,
  Code,
  Divider,
  Image,
  Link,
  cn,
} from '@heroui/react'
import {
  CircleEllipsisIcon,
  DatabaseIcon,
  InfoIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'

import { GITHUB_URL, LINKS } from '@/constants'
import { SETTINGS_INIT_DATA } from '@/constants/settings/init-data'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { storage } from '@/utils/storage/extension'

import { IconLink } from '@/components/IconLink'
import { ItemButton } from '@/components/ItemButton'
import { ItemLabel } from '@/components/ItemLabel'
import { SettingsInput } from '@/components/SettingsInput'

import { FormsButton } from './FormsButton'
import { ImportExport } from './ImportExport'
import { StorageSizes } from './StorageSizes'

const { name, version } = webext.runtime.getManifest()
const iconUrl = webext.runtime.getURL('/icons/128.png')

const accordionItemClassNames: AccordionItemProps['classNames'] = {
  indicator: cn('-rotate-90 data-open=true:rotate-90'),
}

/**
 * 情報
 */
const accordionItemInfo = (
  <AccordionItem
    key="_info"
    classNames={accordionItemClassNames}
    title="情報"
    startContent={<InfoIcon />}
  >
    <div className="flex flex-col gap-1 py-2">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2 text-medium">
          <Image
            className="select-none"
            radius="none"
            width={24}
            height={24}
            src={iconUrl}
            draggable={false}
          />

          <span className="font-bold">{name}</span>

          <Link
            className="text-[length:inherit] text-foreground-500 dark:text-foreground-600"
            underline="hover"
            href={`${GITHUB_URL}/releases/tag/v${version}`}
            isExternal
          >
            v{version}
          </Link>
        </div>

        <div className="flex flex-row gap-0.5">
          {/* <IconLink
            icon={ClipboardListIcon}
            title="利用者アンケート ①"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfVL8ub7t1qMGLI7BH0ypdV7Ctib6Sns-_VbKhiaRMGLloczw/viewform"
          /> */}
          <FormsButton />
          <IconLink Icon={SiGithub} href={GITHUB_URL} />
        </div>
      </div>
    </div>
  </AccordionItem>
)

/**
 * 各設定
 */
const accordionItemSettings = SETTINGS_INIT_DATA.map(
  ({ id, title, items, Icon }) => (
    <AccordionItem
      key={id}
      classNames={accordionItemClassNames}
      title={title}
      startContent={Icon && <Icon />}
    >
      {items.map((item, idx) => {
        const Input = SettingsInput[item.inputType]

        return (
          <div
            key={idx}
            className={cn(
              'py-0.5',
              'border-foreground-200',
              'not-first:border-t-1'
            )}
          >
            <Input {...(item as any)} />
          </div>
        )
      })}
    </AccordionItem>
  )
)

/**
 * ストレージ
 */
const accordionItemStorage = (
  <AccordionItem
    key="_storage"
    classNames={accordionItemClassNames}
    title="ストレージ"
    startContent={<DatabaseIcon />}
  >
    <StorageSizes />

    <Divider />

    <ImportExport />

    <Divider />

    <div className="flex flex-col gap-2 py-2">
      <ItemButton
        title="設定をリセット"
        description="設定を初期値に戻します。"
        button={{
          variant: 'flat',
          color: 'danger',
          startContent: <RotateCcwIcon />,
          text: 'リセット',
          onPress: settings.remove,
        }}
        confirm={{
          placement: 'top-end',
          title: '設定をリセットしますか？',
          description: '全ての設定が初期値に戻されます。',
        }}
      />

      <ItemButton
        title="ストレージを初期化"
        description="データを全て消去します。"
        button={{
          variant: 'flat',
          color: 'danger',
          startContent: <Trash2Icon />,
          text: '初期化',
          onPress: async () => {
            await storage.remove()
            webext.runtime.reload()
          },
        }}
        confirm={{
          placement: 'top-end',
          title: 'ストレージを初期化しますか？',
          description: '全てのデータが消去されます。',
        }}
      />
    </div>
  </AccordionItem>
)

/**
 * その他
 */
const accordionItemOthers = (
  <AccordionItem
    key="_others"
    classNames={accordionItemClassNames}
    title="その他"
    startContent={<CircleEllipsisIcon />}
  >
    <div className="flex flex-col gap-1 py-2">
      {LINKS.map(({ title, label, url }, idx) => (
        <div
          key={idx}
          className="flex flex-row items-center justify-between py-1"
        >
          <ItemLabel title={title} />

          {url ? (
            <Link
              size="sm"
              color="primary"
              underline="hover"
              showAnchorIcon
              href={url}
              isExternal
            >
              {label}
            </Link>
          ) : (
            <Code className="rounded-md py-0" size="sm" color="primary">
              {label}
            </Code>
          )}
        </div>
      ))}
    </div>
  </AccordionItem>
)

export function Settings() {
  return (
    <Accordion
      className="p-2"
      itemClasses={{
        base: cn(
          'overflow-hidden',
          'data-[open=true]:overflow-visible',
          'border-1 border-foreground-200 p-0! shadow-none!',
          '*:px-3'
        ),
        heading: cn(
          'sticky top-0 z-20',
          'gap-0',
          '-mb-px rounded-t-medium',
          'border-foreground-200 border-b-1',
          'bg-content1'
        ),
        trigger: 'gap-2',
        startContent: '*:size-4',
        content: 'flex flex-col overflow-hidden py-px',
      }}
      variant="splitted"
      isCompact
      defaultExpandedKeys={['_info']}
    >
      {accordionItemInfo}
      {...(accordionItemSettings as any)}
      {accordionItemStorage}
      {accordionItemOthers}
    </Accordion>
  )
}
