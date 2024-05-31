export interface Events {
  args: { [index: string | number]: any },
  address: string,
  blockNumber: number,
  chainId: number,
  eventName: string,
  provider: string | undefined,
  timestamp: number
}