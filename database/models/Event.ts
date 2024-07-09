export interface Events {
  args: { [index: string | number]: any },
  address: string,
  blockNumber: number,
  transactionHash: string
  chainId: number,
  eventName: string,
  provider: string | undefined,
  client: string | undefined,
  timestamp: number
}