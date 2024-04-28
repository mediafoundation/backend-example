import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter} from "mongodb"
import {DealsController} from "./dealsController"

export class EventsController {
  static async upsertEvent(event: EventFormatted, chainId: number, blockTimestamp: number) {
    // Make sure event belongs to marketplace
    if(event.args._marketplaceId && event.args._marketplaceId.toString() != process.env.MARKETPLACE_ID) {
      throw new Error(`Event does not belong to marketplace ${process.env.MARKETPLACE_ID}`)
    }

    //Get deal-event provider
    const deal = event.args._dealId ? await DealsController.getDealByIdAndChain( event.args._dealId , chainId) : null

    //Get block-event timestamp
    await eventsCollection.insertOne({...event, provider: deal?.deal.provider, timestamp: blockTimestamp, chainId: chainId})
  }

  static async getEvents(filter: Filter<Document> = {}) {
    return eventsCollection.find(filter).toArray()
  }

  static formatEvent(event: any): EventFormatted {
    const result = {...event}

    for (const key of Object.keys(result)) {
      if(typeof result[key] === "bigint"){
        result[key] = result[key].toString()
      }

      else if(typeof result[key] === "object") {
        result[key] = this.formatEvent(result[key])
      }
    }

    return result
  }

  static async calculateProviderRevenue(provider: string, chainId: number | undefined, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) {
    let totalRevenue: bigint = 0n
    const events = await eventsCollection.find({
      provider: provider,
      timestamp: {
        $gte: fromDate,
        $lte: toDate
      },
      eventName: "DealCollected",
      chainId: chainId
    }).toArray()

    events.forEach((event) => {
      totalRevenue += BigInt(event.args._paymentToProvider)
    })

    return totalRevenue
  }

  static async calculateProviderNewDeals(provider: string, chainId: number, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) {
    return eventsCollection.countDocuments({
      provider: provider,
      timestamp: {
        $gte: fromDate,
        $lte: toDate
      },
      chainId: chainId,
      eventName: "DealCreated"
    })
  }
}