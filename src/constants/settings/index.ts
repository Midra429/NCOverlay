import type { StateSlotDetail } from '@/ncoverlay/state'
import type {
  AutoSearchTarget,
  CommentCustomizeTarget,
  SettingsKey,
} from '@/types/storage'

export const SOURCE_NAMES: Record<StateSlotDetail['type'], string> = {
  normal: '通常',
  official: '公式',
  danime: 'dアニメ',
  chapter: 'dアニメ(分割)',
  szbh: 'コメント専用',
  jikkyo: '実況',
  nicolog: '生放送',
  file: 'ファイル',
}

export const COMMENT_CUSTOMIZE_TARGET_KEYS: CommentCustomizeTarget[] = [
  'normal',
  'official',
  'danime',
  'szbh',
  'jikkyo',
  'nicolog',
  'file',
]

export const AUTO_SEARCH_TARGET_KEYS: AutoSearchTarget[] = [
  'official',
  'danime',
  'chapter',
  'szbh',
  'jikkyo',
  'nicolog',
]

export const SLOTS_REFRESH_SETTINGS_KEYS: SettingsKey[] = [
  'settings:comment:customize',
  'settings:comment:hideAssistedComments',
  'settings:comment:adjustJikkyoOffset',
  'settings:autoSearch:jikkyoOnlyAdjustable',
  'settings:ng:words',
  'settings:ng:commands',
  'settings:ng:ids',
  'settings:ng:largeComments',
  'settings:ng:fixedComments',
  'settings:ng:coloredComments',
]
