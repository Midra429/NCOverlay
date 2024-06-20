export class Logger {
  static appName = 'NCOverlay'
  static header = `[${this.appName}]`

  static log(message: string, ...args: unknown[]) {
    console.log(this.header, message, ...args)
  }

  static debug(message: string, ...args: unknown[]) {
    if (import.meta.env.PROD) return

    console.debug(this.header, message, ...args)
  }

  static error(message: string, ...args: unknown[]) {
    console.error(this.header, message, ...args)
  }

  static group(label: string, ...args: unknown[]) {
    console.group(`${this.header} - ${label}`, ...args)
  }

  static groupCollapsed(label: string, ...args: unknown[]) {
    console.groupCollapsed(`${this.header} - ${label}`, ...args)
  }

  static groupEnd() {
    console.groupEnd()
  }
}
