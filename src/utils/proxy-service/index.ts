export type Service =
  | ((...args: any[]) => Promise<any>)
  | { [key: string]: any | Service }

export type ProtocolMap = {
  [key: string]: (data: { path?: string; args: any[] }) => any
}
