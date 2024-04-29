export interface Events {
  args: any,
  address: string,
  blockNumber: number,
  chainId: number,
  eventName: string,
  provider: string | undefined,
  timestamp: number
}