export type Service =
  | ((...args: any[]) => Promise<any>)
  | { [key: string]: any | Service }

export interface ProtocolMap {
  [key: string]: (data: { paths: string[]; args: any[] }) => any
}
