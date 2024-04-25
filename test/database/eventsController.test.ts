import {connectToMongodb, eventsCollection} from "../../database/database"
import {MongoClient} from "mongodb"
import {EventsController} from "../../database/controllers/eventsController"
import {generateUniqueEventId} from "../../utils/hash"
import {Chain} from "../../database/models/Chain"
import {resetDB} from "../../database/utils"
import {DealsController} from "../../database/controllers/dealsController"
import {Blockchain, Sdk, validChains} from "../../../media-sdk"

let db: MongoClient
const mockEvent = {
  address: "0x77922d037e74c9ba2edfc1019329bee741563372",
  blockNumber: 5368391n,
  transactionHash: "0x62f395c3a1dd2daabc13d5b9663d8a36b42cecf380b0371252d59fcbf147b701",
  args: {
    _marketplaceId: 1n,
    _dealId: 1n,
    _paymentToProvider: 10900000000118592000n,
    _totalPayment: 10900000000118592000n
  },
  eventName: "DealCreated"
}
const mockDeal = {
  id: 1n,
  offerId: 1n,
  client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
  provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  resourceId: 3n,
  totalPayment: 0n,
  blockedBalance: 446499999999553500n,
  terms: {
    pricePerSecond: 111111111111n,
    minDealDuration: 900n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
  },
  status: {
    active: true,
    createdAt: 1710153976n,
    acceptedAt: 1710153976n,
    billingStart: 1710153976n,
    cancelled: false,
    cancelledAt: 0n
  }
}

beforeAll(async () => {
  db = await connectToMongodb()
  await resetDB()
  await Chain.create({
    chainId: 1,
    name: "Chain 1"
  })

  await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)
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
    const sdk = new Sdk({chain: validChains["84532"]})
    const blockchain = new Blockchain(sdk)
    await EventsController.upsertEvent(formattedEvent, 1, blockchain)
    const events = await EventsController.getEvents()
    expect(events.length).toBe(1)
    expect(events[0]).toStrictEqual({...formattedEvent, provider: mockDeal.provider, timestamp: 1706505070})
  })

  /*test("Calculate prover revenue", async () => {
    await EventsController.upsertEvent(EventsController.formatEvent(mockEvent))

    const result = await EventsController.getEvents()
  })*/
})