import {eventsCollection} from "../database"
import {EventFormatted} from "../models/types/event"
import {Document, Filter} from "mongodb"
import {generateUniqueEventId} from "../../utils/hash"

export class EventsController {
  static async upsertEvent(event: EventFormatted) {
    await eventsCollection.insertOne(event)
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