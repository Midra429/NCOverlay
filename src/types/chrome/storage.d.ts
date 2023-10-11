export type ChromeStorage = {
  enable: boolean
  opacity: number
  lowPerformance: boolean
  showChangelog: boolean
}

export type ChromeStorageChanges = Partial<{
  [key in keyof ChromeStorage]: {
    newValue?: ChromeStorage[key]
    oldValue?: ChromeStorage[key]
  }
}>
