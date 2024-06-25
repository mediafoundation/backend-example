import {ObjectId} from "mongodb"

export type EventFormatted = {
  _id: ObjectId,
  address: string,
  data: string,
  blockNumber: number,
  args: NonNullable<{ [index: string]: any }>,
  eventName: string,
}