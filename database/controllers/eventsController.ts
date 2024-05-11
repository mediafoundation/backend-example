import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter, WithId} from "mongodb"
import {DealsController} from "./dealsController"
import {Events} from "../models/Event"
import {Deal} from "../models/deals/Deal"

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

  static async calculateFutureProviderRevenue(provider: string, chainId: number | undefined, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) {

    let totalRevenue = BigInt(0)
    const deals = await DealsController.getDeals(chainId, {provider: provider})

    for (const deal of deals) {

      const events = await eventsCollection.find({
        provider: provider,
        timestamp: {
          $gte: fromDate,
          $lte: toDate
        },
        $or: [
          {eventName: "DealCreated"},
          {eventName: "DealCancelled"},
          {eventName: "AddedBalance"},
          {eventName: "DealCollected"},
        ],
        chainId: chainId,
        "args._dealId": deal.dealId
      }).toArray()

      //console.log("Deal", deal.dealId, events)
      if(events.length > 1) {
        EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
      }
      totalRevenue += EventsController.calculateDealRevenue(events, deal, toDate)
    }

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

  private static calculateDealRevenue(events: Events[], deal: Deal, toTimestamp: number) {
    let totalDealRevenue = BigInt(0)
    for (const event of events) {
      if(event.eventName == "DealCancelled") {
        //todo: check for time accuracy on calculus
        totalDealRevenue += BigInt(event.args._paymentToProvider)
      }

      if(event.eventName == "DealCreated" && event.args._autoAccept) {
        if(this.dealIsActive(deal)) {
          const elapsedTime = BigInt(toTimestamp - deal.billingStart)
          totalDealRevenue += elapsedTime * BigInt(deal.pricePerSecond)
        }

        else{
          //todo: get fee
          totalDealRevenue += BigInt(deal.blockedBalance)
        }
      }
    }

    console.log("Deal", deal.id, totalDealRevenue)

    return totalDealRevenue
  }

  private static deleteUselessEvents<T>(events: T[], comparator: (a: T, b: string) => boolean) {

    const breakpoints = ["DealCreated"]

    breakpoints.forEach(breakpoint => {
      const index = events.findIndex(item => comparator(item, breakpoint))
      if(index !== -1){
        events.splice(index, 1)
      }
    })

    return events
  }

  private static dealIsActive(deal: Deal) {
    const totalTime = deal.blockedBalance / deal.pricePerSecond
    const calculatedEnd = deal.billingStart + totalTime
    if(Number(calculatedEnd) * 1000 > 8640000000000000) return true
    const d = new Date(Number(calculatedEnd) * 1000)
    const pad2 = (n: number) => {
      return (n < 10 ? "0" : "") + n
    }
    const formattedCalculatedEnd = `${pad2(
      d.getMonth() + 1
    )}/${pad2(d.getDate())}/${pad2(d.getFullYear())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`

    return Date.parse(formattedCalculatedEnd) > Date.now()
  }
}