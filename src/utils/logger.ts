import * as utilsLogger from '@midra/nco-utils/utils/logger'

utilsLogger.setLoggerName('NCOverlay')
utilsLogger.setLoggerLevels({
  verbose: true,
  info: true,
  warnings: import.meta.env.DEV,
  errors: import.meta.env.DEV,
})

export const { logger } = utilsLogger
