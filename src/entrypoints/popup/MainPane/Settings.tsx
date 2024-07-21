import { memo, useEffect, useCallback, useState } from 'react'
import { Accordion, AccordionItem, Divider, Link, cn } from '@nextui-org/react'
import {
  InfoIcon,
  DatabaseIcon,
  CircleEllipsisIcon,
  ClipboardPenIcon,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'

import { GITHUB_URL, LINKS, SETTINGS_INIT_DATA } from '@/constants'

import { webext } from '@/utils/webext'
import { filesize } from '@/utils/filesize'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoStateJson } from '@/hooks/useNcoState'

import { IconLink } from '@/components/icon-link'
import { SettingsInput } from '@/components/settings-input'
import { ItemButton } from '@/components/item-button'

const { name, version } = webext.runtime.getManifest()

const FormsButton: React.FC = () => {
  const ncoStateJson = useNcoStateJson('vod', 'title')

  const onPress = useCallback(async () => {
    const tab = await webext.getCurrentActiveTab()

    webext.tabs.create({
      url: await getFormsUrl({
        vod: ncoStateJson?.vod,
        title: ncoStateJson?.title,
        url: ncoStateJson && tab?.url,
      }),
    })
  }, [ncoStateJson])

  return (
    <IconLink
      icon={ClipboardPenIcon}
      title="不具合報告・機能提案"
      onPress={onPress}
    />
  )
}

const StorageSizes: React.FC = () => {
  const [storageBytes, setStorageBytes] = useState<number>(0)
  const [settingsBytes, setSettingsBytes] = useState<number>(0)

  useEffect(() => {
    const updateStorageSizes = () => {
      storage.getBytesInUse().then(setStorageBytes)
      settings.getBytesInUse().then(setSettingsBytes)
    }

    updateStorageSizes()

    webext.storage.local.onChanged.addListener(updateStorageSizes)

    return () => {
      webext.storage.local.onChanged.removeListener(updateStorageSizes)
    }
  }, [])

  return (
    <div className="flex flex-row items-center justify-evenly py-1.5">
      <span className="text-tiny">全体: {filesize(storageBytes)}</span>

      <Divider className="h-4" orientation="vertical" />

      <span className="text-tiny">設定: {filesize(settingsBytes)}</span>

      <Divider className="h-4" orientation="vertical" />

      <span className="text-tiny">
        その他: {filesize(storageBytes - settingsBytes)}
      </span>
    </div>
  )
}

/**
 * 情報
 */
const accordionItemInfo = (
  <AccordionItem key="_info" title="情報" startContent={<InfoIcon />}>
    <div className="flex flex-col gap-1 py-2">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 text-medium">
          <span className="font-bold">{name}</span>
          <Link
            className="text-[length:inherit] text-foreground-500"
            href={`${GITHUB_URL}/releases/tag/v${version}`}
            isExternal
            underline="hover"
          >
            v{version}
          </Link>
        </div>

        <div className="flex flex-row gap-0.5">
          <FormsButton />
          <IconLink icon={SiGithub} href={GITHUB_URL} />
        </div>
      </div>
    </div>
  </AccordionItem>
)

/**
 * 各設定
 */
const accordionItemSettings = SETTINGS_INIT_DATA.map(
  ({ id, title, items, icon: Icon }) => (
    <AccordionItem key={id} title={title} startContent={Icon && <Icon />}>
      {items.map((item) => {
        const Input = SettingsInput[item.inputType]

        return (
          <div
            key={item.settingsKey}
            className={cn(
              'border-foreground-200',
              '[&:not(:first-child)]:border-t-1'
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
    title="ストレージ"
    startContent={<DatabaseIcon />}
  >
    <StorageSizes />

    <Divider />

    <div className="flex flex-col gap-2 py-2">
      <ItemButton
        key="settings.remove"
        title="設定をリセット"
        description="設定を初期値に戻します。"
        button={{
          variant: 'flat',
          color: 'danger',
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
        key="storage.remove"
        title="ストレージを初期化"
        description="データを全て消去します。"
        button={{
          variant: 'flat',
          color: 'danger',
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
    title="その他"
    startContent={<CircleEllipsisIcon />}
  >
    <div className="flex flex-col gap-1 py-2">
      {LINKS.map(({ title, label, url }, idx) => (
        <ItemButton
          key={idx}
          title={title}
          button={{
            variant: 'light',
            color: 'primary',
            text: <span className="text-small">{label}</span>,
            onPress: () => webext.tabs.create({ url }),
          }}
        />
      ))}
    </div>
  </AccordionItem>
)

export const Settings: React.FC = memo(() => {
  return (
    <Accordion
      className="p-0"
      itemClasses={{
        base: cn(
          'overflow-hidden',
          'data-[open=true]:overflow-visible',
          'border-1 border-foreground-100 !p-0 !shadow-small',
          '[&>*]:px-3'
        ),
        heading: cn(
          'sticky -top-2 z-20',
          'gap-0',
          'mb-[-1px] rounded-t-medium',
          'border-b-1 border-foreground-200',
          'bg-content1'
        ),
        trigger: 'gap-2',
        startContent: '[&>*]:size-4',
        content: 'flex flex-col overflow-hidden py-[1px]',
      }}
      isCompact
      variant="splitted"
      defaultExpandedKeys={['_info']}
    >
      {[
        accordionItemInfo,
        accordionItemSettings,
        accordionItemStorage,
        accordionItemOthers,
      ].flat()}
    </Accordion>
  )
})
