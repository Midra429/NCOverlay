export type Service =
  | ((...args: unknown[]) => Promise<any>)
  | { [key: string]: any | Service }

export interface ProtocolMap {
  [key: string]: (data: { paths: string[]; args: unknown[] }) => any
}
