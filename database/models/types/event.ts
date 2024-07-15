import {ObjectId} from "mongodb"

export type EventFormatted = {
  _id: ObjectId,
  address: string,
  blockNumber: number,
  transactionHash: string,
  args: { [index: string]: any },
  eventName: string,
}