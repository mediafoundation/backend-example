import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter, WithId} from "mongodb"
import {DealsController} from "./dealsController"
import {Events} from "../models/Event"
import {DealAttributes} from "../models/deals/Deal"

interface DailyRevenue {
  [date: number]: bigint;
}

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

  static async calculateProviderRevenue(
    provider: string,
    chainId: number,
    fromDate: number = 0,
    toDate: number = Math.floor(Date.now() / 1000)
  ): Promise<{
    dailyRevenue: DailyRevenue,
    totalRevenue: bigint,
    collectedRevenue: bigint,
    uncollectedRevenue: bigint
  }> {
    const dailyRevenue: DailyRevenue = {}
    let totalRevenue = 0n
    let collectedRevenue = 0n
    const deals = await DealsController.getDeals(chainId, { provider: provider })

    // Initialize the daily revenue dictionary for each day in the interval
    let currentDay = fromDate
    while (currentDay <= toDate) {
      const dayKey = new Date(currentDay * 1000).toISOString().split("T")[0]
      dailyRevenue[Date.parse(dayKey)] = BigInt(0)
      currentDay += 86400 // Move to the next day
    }

    for (const deal of deals) {
      //if (!deal.active) continue // Skip deals that have not started

      const dealStatus = this.getDealStatus(deal)

      const dealStartDate = deal.billingStart
      const dealEndDate = dealStatus.endTimestamp

      // Calculate the active period for the deal within the given interval
      const activeFromDate = Math.max(fromDate, dealStartDate)
      const activeToDate = Math.min(toDate, dealEndDate)
      const activeSeconds = activeToDate - activeFromDate

      if (activeSeconds <= 0) continue // Skip if no active period within the interval

      let totalDealRevenue

      // Calculate the total revenue for the deal within the active period
      if (deal.billFullPeriods) {
        const periods = BigInt(activeSeconds) == 0n
          ? 1n
          : (BigInt(activeSeconds) - 1n) / BigInt(deal.minDealDuration) + 1n
        totalDealRevenue =
          periods *
          BigInt((deal.minDealDuration *
            deal.pricePerSecond))
        // if more than one period elapsed and the deal is not set to be billed for full periods afterward
      } else {
        totalDealRevenue = BigInt(deal.pricePerSecond) * BigInt(activeSeconds)
      }
      //let totalDealRevenue = BigInt(deal.pricePerSecond) * BigInt(activeSeconds)

      totalRevenue += totalDealRevenue
      collectedRevenue += BigInt(deal.totalPayment)

      // Calculate the number of active days
      //const activeDays = Math.ceil((activeToDate - activeFromDate) / 86400)

      // Distribute the total revenue across the active days
      let activeDay = activeFromDate
      while (activeDay <= activeToDate) {
        const dayKey = new Date(activeDay * 1000).toISOString().split("T")[0]
        if(totalDealRevenue >= (BigInt(deal.pricePerSecond) * BigInt(86400))) {
          dailyRevenue[Date.parse(dayKey)] += BigInt(deal.pricePerSecond) * BigInt(86400)
          totalDealRevenue -= BigInt(deal.pricePerSecond) * BigInt(86400)
        }
        else{
          dailyRevenue[Date.parse(dayKey)] += totalDealRevenue
        }

        activeDay += 86400 // Move to the next day
      }
    }

    let uncollectedRevenue
    if(totalRevenue > collectedRevenue) {
      uncollectedRevenue = totalRevenue - collectedRevenue
    }
    else {
      uncollectedRevenue = collectedRevenue - totalRevenue
    }
    return {
      dailyRevenue: dailyRevenue,
      totalRevenue: totalRevenue,
      collectedRevenue: collectedRevenue,
      uncollectedRevenue: uncollectedRevenue
    }
  }

  /*static async calculateProviderRevenue(provider: string, chainId: number | undefined, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000): Promise<bigint> {
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
  }*/

  /*static async calculateFutureProviderRevenue(provider: string, chainId: number, fromDate: number = 0, toDate: number = Math.floor(Date.now()/1000)) {

    let totalRevenue = BigInt(0)
    const deals = await DealsController.getDeals(chainId, {provider: provider})

    for (const deal of deals) {

      let events = await eventsCollection.find({
        provider: provider,
        timestamp: {
          $gte: fromDate,
          $lte: toDate
        },
        chainId: chainId,
        "args._dealId": deal.dealId
      }).toArray()

      //console.log("Deal", deal.dealId, events)
      if(events.length > 1) {
        events = EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
      }

      console.log("Events", deal.dealId, events)
      totalRevenue += EventsController.calculateDealFutureRevenue(events, deal, fromDate, toDate)
    }

    return totalRevenue
  }
  
  static async calculateCollectedProviderRevenue(provider: string, chainId: number, fromDate: number = 0, toDate: number = Math.floor(Date.now()/1000)) {
    let totalRevenue = 0n
    const deals = await DealsController.getDeals(chainId, {provider: provider})
    for (const deal of deals) {
      const events = await eventsCollection.find({
        provider: provider,
        eventName: "DealCollected",
        timestamp: {
          $gte: fromDate,
          $lte: toDate
        },
        chainId: chainId,
        "args._dealId": deal.dealId
      }).toArray()
      const dealRevenue = this.calculateDealCollectedRevenue(events)
      totalRevenue += dealRevenue
    }

    return totalRevenue
  }*/

  static async calculateProviderNewDeals(provider: string, chainId: number, fromDate: number = 0, toDate: number = Date.now() / 1000): Promise<number> {
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

  /*static async calculateNetworkNewResources(chainId: number, fromDate: number = Date.now() / 1000, toDate: number = Date.now() / 1000) : Promise<number>{
    return eventsCollection.countDocuments({
      timestamp: {
        $gte: fromDate,
        $lte: toDate
      },
      chainId: chainId,
      eventName: "AddedResource"
    })
  }*/

  static calculateDealFutureRevenue(events: Events[], deal: DealAttributes, fromTimestamp: number, toTimestamp: number) {
    let totalDealRevenue = BigInt(0)
    for (let i = 0; i < events.length; i++){
      //Calculate earn if no singlePeriodOnly
      if(this.dealIsActive(deal)) {
        const elapsedTime = deal.billingStart >= fromTimestamp ? BigInt(toTimestamp - Number(deal.billingStart)) : BigInt(toTimestamp - fromTimestamp)
        if (elapsedTime < deal.minDealDuration) {
          // if the elapsed time is less than the minimum duration, payment is for entire minimum duration
          totalDealRevenue =
            BigInt(deal.pricePerSecond *
              deal.minDealDuration)
        } else {
          // if the deal is billable only for full periods
          if (deal.billFullPeriods) {
            const periods = elapsedTime == 0n
              ? 1n
              : (elapsedTime - 1n) / BigInt(deal.minDealDuration) + 1n
            totalDealRevenue =
              periods *
              BigInt((deal.minDealDuration *
                deal.pricePerSecond))
            // if more than one period elapsed and the deal is not set to be billed for full periods afterward
          } else {
            totalDealRevenue = BigInt(deal.pricePerSecond) * elapsedTime
          }
        }
      }

      else{
        if(deal.billingStart < fromTimestamp) {
          const notElapseTime = fromTimestamp - deal.billingStart
          totalDealRevenue += BigInt(deal.blockedBalance) - BigInt(deal.pricePerSecond) * BigInt(notElapseTime)
        }
        else{
          totalDealRevenue += BigInt(deal.blockedBalance)
        }
      }
    }

    return totalDealRevenue
  }

  static calculateDealCollectedRevenue(events: Events[]) {
    let totalDealRevenue = 0n
    for (const event of events) {
      totalDealRevenue += BigInt(event.args._paymentToProvider)
    }

    return totalDealRevenue
  }

  static deleteUselessEvents<T>(events: T[], comparator: (a: T, b: string) => boolean) {

    //Delete all elements on index equal or minor to last DealCollected

    let index = events.map(item => comparator(item, "AddedBalance")).lastIndexOf(true)
    if (index !== -1) {
      events = events.slice(index)
    }

    index = events.map(item => comparator(item, "DealCollected")).lastIndexOf(true)
    if (index !== -1) {
      events = events.slice(index+1)

    }

    index = events.map(item => comparator(item, "DealCancelled")).lastIndexOf(true)
    if (index !== -1) {
      events = events.slice(index+1)

    }

    index = events.map(item => comparator(item, "DealAccepted")).lastIndexOf(true)
    if(index !== -1) {
      events = events.slice(index)
    }

    return events
  }

  private static dealIsActive(deal: DealAttributes) {
    if(!deal.active) return false
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

  private static getDealStatus(deal: DealAttributes): { active: boolean, endTimestamp: number } {
    if (deal.acceptedAt == 0) return { active: false, endTimestamp: 0 } //Check Deal has been accepted
    if(deal.cancelled) return { active: false, endTimestamp: deal.cancelledAt } //Check Deal has been cancelled

    const totalTime = deal.blockedBalance / deal.pricePerSecond
    const calculatedEnd = deal.billingStart + totalTime

    if (Number(calculatedEnd) * 1000 > 8640000000000000) return { active: true, endTimestamp: Number.MAX_SAFE_INTEGER }

    const d = new Date(Number(calculatedEnd) * 1000)
    const pad2 = (n: number) => (n < 10 ? "0" : "") + n
    const formattedCalculatedEnd = `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${pad2(d.getFullYear())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`

    const isActive = Date.parse(formattedCalculatedEnd) > Date.now()
    const endTimestamp = Date.parse(formattedCalculatedEnd) / 1000

    return { active: isActive, endTimestamp: endTimestamp }
  }

}