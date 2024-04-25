import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter} from "mongodb"
import {generateUniqueEventId} from "../../utils/hash"
import {DealsController} from "./dealsController"
import { Blockchain } from "media-sdk"

export class EventsController {
  static async upsertEvent(event: EventFormatted, chainId: number, blockChainInstance: Blockchain) {
    // Make sure event belongs to marketplace
    if(event.args._marketplaceId != process.env.MARKETPLACE_ID) {
      throw new Error(`Event does not belong to marketplace ${process.env.MARKETPLACE_ID}`)
    }

    //Get deal-event provider
    const deal = await DealsController.getDealByIdAndChain(event.args._dealId, chainId)

    //Get block-event timestamp
    const block = await blockChainInstance.getBlockTimestamp(BigInt(event.blockNumber))

    await eventsCollection.insertOne({...event, provider: deal?.deal.provider, timestamp: block.timestamp})
  }

  static async getEvents(filter: Filter<Document> = {}) {
    return eventsCollection.find(filter).toArray()
  }

  static formatEvent(event: any): EventFormatted {
    const result = {...event}

    for (const key of Object.keys(result)) {
      if(typeof result[key] === "bigint"){
        result[key] = Number(result[key])
      }

      else if(typeof result[key] === "object") {
        result[key] = this.formatEvent(result[key])
      }
    }

    if(event.transactionHash) {
      result["_id"] = generateUniqueEventId(event.transactionHash)
    }

    return result
  }

  static async calculateProviderRevenue(provider: string, fromDate?: Date, toDate?: Date) {
    return await eventsCollection.find({
      provider: provider,
      $and: [
        {date: {$gt: fromDate}},
        {date: {$lt: toDate}}
      ]
    }).toArray()
  }
}