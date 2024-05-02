import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter, WithId} from "mongodb"
import {DealsController} from "./dealsController"
import {Events} from "../models/Event"

export class EventsController {
  static async upsertEvent(event: EventFormatted, chainId: number, blockTimestamp: number) {
    // Make sure event belongs to marketplace
    if(event.args._marketplaceId && event.args._marketplaceId != process.env.MARKETPLACE_ID) {
      throw new Error(`Event does not belong to marketplace ${process.env.MARKETPLACE_ID}`)
    }

    //Get deal-event provider
    const deal = event.args._dealId ? await DealsController.getDealByIdAndChain( event.args._dealId , chainId) : null

    //Get block-event timestamp
    await eventsCollection.insertOne({...event, provider: deal?.deal.provider, timestamp: blockTimestamp, chainId: chainId})
  }

  static async getEvents(filter: Filter<Document> = {}): Promise<WithId<Events>[]> {
    return eventsCollection.find(filter).toArray()
  }

  static formatEvent(event: any): EventFormatted {
    const result: any = {
      args: event.args,
      address: event.address,
      blockNumber: event.blockNumber.toString(),
      eventName: event.eventName
    }

    for (const key of Object.keys(result.args)) {
      if(typeof result.args[key] === "bigint"){
        result.args[key] = result.args[key].toString()
      }

      else if(typeof result.args[key] === "object") {
        result.args[key] = this.formatEvent(result.args[key])
      }
    }

    return result
  }

  static async calculateProviderRevenue(provider: string, chainId: number | undefined, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000): Promise<bigint> {
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

  static async calculateProviderNewDeals(provider: string, chainId: number, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000): Promise<number> {
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

  static async calculateNetworkNewResources(chainId: number, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) : Promise<number>{
    return eventsCollection.countDocuments({
      timestamp: {
        $gte: fromDate,
        $lte: toDate
      },
      chainId: chainId,
      eventName: "AddedResource"
    })
  }
}