import {connectToMongodb, eventsCollection} from "../../database/database"
import {MongoClient} from "mongodb"
import {EventsController} from "../../database/controllers/eventsController"
import {generateUniqueEventId} from "../../utils/hash"
import {Chain} from "../../database/models/Chain"
import {resetDB} from "../../database/utils"
import {DealsController} from "../../database/controllers/dealsController"

let db: MongoClient
const dealCollectedMockEvent = {
  address: "0x77922d037e74c9ba2edfc1019329bee741563372",
  blockNumber: 2n,
  transactionHash: "0x62f395c3a1dd2daabc13d5b9663d8a36b42cecf380b0371252d59fcbf147b701",
  args: {
    _marketplaceId: 1n,
    _dealId: 1n,
    _paymentToProvider: 10900000000118592000n,
    _totalPayment: 10900000000118592000n
  },
  eventName: "DealCollected"
}
/*const dealCreatedMockEvent  = {
  address: "0x77922d037e74c9ba2edfc1019329bee741563372",
  blockNumber: 1n,
  transactionHash: "0x62f395c3a1dd2daabc13d5b9663d8a36b42cecf380b0371252d59fcbf147b701",
  args: {
    _marketplaceId: 1n,
    _dealId: 1n,
    _amount: 8592000n,
    _autoAccept: true
  },
  eventName: "DealCreated"
}*/


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

async function populateDealCollected(provider: string, amount: number, chainId: number, blockTimestamp: number) {
  for (let i = 0; i < amount; i++) {
    const copyDeal = structuredClone(mockDeal)
    copyDeal.id = BigInt(i)
    copyDeal.provider = provider
    await DealsController.upsertDeal(DealsController.formatDeal(copyDeal), chainId)

    const copyEvent = structuredClone(dealCollectedMockEvent)
    copyEvent["args"]["_dealId"] = BigInt(i)
    copyEvent.transactionHash = i.toString()

    await EventsController.upsertEvent(EventsController.formatEvent(copyEvent), chainId, blockTimestamp)
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
    const expectedId = generateUniqueEventId(dealCollectedMockEvent.transactionHash)
    const result = EventsController.formatEvent(dealCollectedMockEvent)
    expect(result.blockNumber).toBe(2)
    expect(result.args._marketplaceId).toBe(1)
    expect(result._id).toBe(expectedId)
  })

  test("Insert event", async () => {
    const formattedEvent = EventsController.formatEvent(dealCollectedMockEvent)
    await EventsController.upsertEvent(formattedEvent, 1, 1695768292)
    const events = await EventsController.getEvents()
    expect(events.length).toBe(1)
    expect(events[0]).toStrictEqual({...formattedEvent, provider: mockDeal.provider, timestamp: 1695768292})
  })

  test("Calculate provider revenue", async () => {
    await populateDealCollected("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 2, 1, 1)

    const result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0, 2)
    expect(result).toBe(2*Number(dealCollectedMockEvent.args._paymentToProvider))
  })
})