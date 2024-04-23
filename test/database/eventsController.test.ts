import {connectToMongodb, eventsCollection} from "../../database/database"
import {MongoClient} from "mongodb"
import {EventsController} from "../../database/controllers/eventsController"
import {generateUniqueEventId} from "../../utils/hash"

let db: MongoClient
const mockEvent = {
  address: "0x77922d037e74c9ba2edfc1019329bee741563372",
  blockNumber: 5368391n,
  transactionHash: "0x62f395c3a1dd2daabc13d5b9663d8a36b42cecf380b0371252d59fcbf147b701",
  args: {
    _marketplaceId: 1n,
    _dealId: 52n,
    _paymentToProvider: 10900000000118592000n,
    _totalPayment: 10900000000118592000n
  },
  eventName: "DealCreated"
}

beforeAll(async () => {
  db = await connectToMongodb()
})

afterAll(async () => {
  await db.close()
})

afterEach(async () => {
  await eventsCollection.drop()
})

describe("Events Controller", () => {

  test("Format event", async () => {
    const expectedId = generateUniqueEventId(mockEvent.transactionHash)
    const result = EventsController.formatEvent(mockEvent)
    expect(result.blockNumber).toBe(5368391)
    expect(result.args._marketplaceId).toBe(1)
    expect(result._id).toBe(expectedId)
  })

  test("Insert event", async () => {
    const formattedEvent = EventsController.formatEvent(mockEvent)
    await EventsController.upsertEvent(formattedEvent)
    const events = await EventsController.getEvents()
    expect(events.length).toBe(1)
    expect(events[0]).toStrictEqual(formattedEvent)
  })

  /*test("Calculate prover revenue", async () => {
    await EventsController.upsertEvent(EventsController.formatEvent(mockEvent))

    const result = await EventsController.getEvents()
  })*/
})