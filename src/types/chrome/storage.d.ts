export type ChromeStorageSettings = {
  enable: boolean
  opacity: number
  lowPerformance: boolean
  allowWeakMatch: boolean
  showChangelog: boolean
}

export type ChromeStorage = ChromeStorageSettings

export type ChromeStorageChanges = Partial<{
  [key in keyof ChromeStorage]: {
    newValue?: ChromeStorage[key]
    oldValue?: ChromeStorage[key]
  }
}>
