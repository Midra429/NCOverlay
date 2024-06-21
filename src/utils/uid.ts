import { customAlphabet } from 'nanoid'
import { alphanumeric } from 'nanoid-dictionary'

export const uid = customAlphabet(alphanumeric, 16)
