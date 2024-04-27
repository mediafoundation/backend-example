import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter} from "mongodb"
import {generateUniqueEventId} from "../../utils/hash"
import {DealsController} from "./dealsController"

export class EventsController {
  static async upsertEvent(event: EventFormatted, chainId: number, blockTimestamp: number) {
    // Make sure event belongs to marketplace
    if(event.args._marketplaceId != process.env.MARKETPLACE_ID) {
      throw new Error(`Event does not belong to marketplace ${process.env.MARKETPLACE_ID}`)
    }

    //Get deal-event provider
    const deal = await DealsController.getDealByIdAndChain(event.args._dealId, chainId)

    //Get block-event timestamp
    await eventsCollection.insertOne({...event, provider: deal?.deal.provider, timestamp: blockTimestamp})
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

  static async calculateProviderRevenue(provider: string, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) {
    let totalRevenue: number = 0
    const events = await eventsCollection.find({
      provider: provider,
      timestamp: {
        $gte: fromDate,
        $lte: toDate
      },
      eventName: "DealCollected"
    }).toArray()

    events.forEach((event) => {
      totalRevenue += event.args._paymentToProvider
    })

    return totalRevenue
  }
}