import { WebExtSettings } from '.'
import { storage } from '../storage/extension'

export const settings = new WebExtSettings(storage)
