import type { V1Comment } from '@xpadev-net/niconicomments'
import { COLOR_COMMANDS, COLOR_COMMANDS_DARKER } from '@/constants'
import { formatDuration } from '@/utils/formatDuration'
import { formatDate } from '@/utils/formatDate'

const template = document.querySelector<HTMLTemplateElement>(
  '#TemplateItemComment'
)!.content

export const createCommentItem = (comment: V1Comment) => {
  const item = template.firstElementChild!.cloneNode(true) as HTMLElement

  const [
    commentText,
    commentTime,
    commentNicoru,
    commentDate,
    commentCommands,
  ] = [...item.children] as HTMLElement[]

  // コメント
  const commentTextSpan = commentText.firstElementChild! as HTMLElement
  commentTextSpan.textContent = comment.body
  commentText.title = commentTextSpan.textContent

  for (const command of comment.commands) {
    if (['white'].includes(command)) continue

    if (command in COLOR_COMMANDS) {
      commentTextSpan.classList.add('command-color')

      commentTextSpan.style.backgroundColor = COLOR_COMMANDS[command]

      if (COLOR_COMMANDS_DARKER.includes(command)) {
        commentText.style.color = '#fff'
      }
    }

    if (['mincho', 'small', 'big'].includes(command)) {
      commentTextSpan.classList.add(`command-${command}`)
    }
  }

  // 再生時間
  commentTime.textContent = formatDuration(comment.vposMs / 1000)

  // ニコる
  commentNicoru.textContent = comment.nicoruCount.toLocaleString()

  if (10 <= comment.nicoruCount) {
    item.classList.add('nicoru-lv4')
  } else if (6 <= comment.nicoruCount) {
    item.classList.add('nicoru-lv3')
  } else if (3 <= comment.nicoruCount) {
    item.classList.add('nicoru-lv2')
  } else if (1 <= comment.nicoruCount) {
    item.classList.add('nicoru-lv1')
  }

  // 投稿日時
  commentDate.textContent = formatDate(comment.postedAt)

  // コマンド
  commentCommands.textContent = comment.commands.join(' ')
  commentCommands.title = commentCommands.textContent

  return item
}
