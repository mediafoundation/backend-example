import {ObjectId} from "mongodb"

export type EventFormatted = {
  _id: ObjectId,
  address: string,
  topics: NonNullable<any>,
  data: string,
  blockNumber: 5368391,
  transactionHash: string,
  transactionIndex: 35,
  blockHash: string,
  logIndex: 78,
  removed: false,
  args: NonNullable<any>,
  eventName: string,
  date: Date
}