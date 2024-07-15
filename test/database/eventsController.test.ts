import {connectToMongodb, eventsCollection, sequelize} from "../../database/database"
import {MongoClient} from "mongodb"
import {EventsController} from "../../database/controllers/eventsController"
import {Chain} from "../../database/models/Chain"
import {resetSequelizeDB} from "../../database/utils"
import {DealsController} from "../../database/controllers/dealsController"
import {ProvidersController} from "../../database/controllers/providersController"


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
const dealCreatedMockEvent  = {
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
}


const mockDeal = {
  id: 1n,
  offerId: 1n,
  client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
  provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  resourceId: 3n,
  totalPayment: 0n,
  blockedBalance: 3n,
  terms: {
    pricePerSecond: 1n,
    minDealDuration: 1n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
  },
  status: {
    active: true,
    createdAt: 1n,
    acceptedAt: 1n,
    billingStart: 1n,
    cancelled: false,
    cancelledAt: 0n
  }
}

const secondMockDeal = {
  id: 2n,
  offerId: 1n,
  client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
  provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  resourceId: 3n,
  totalPayment: 0n,
  blockedBalance: 1n,
  terms: {
    pricePerSecond: 1n,
    minDealDuration: 1n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
  },
  status: {
    active: true,
    createdAt: 2n,
    acceptedAt: 3n,
    billingStart: 3n,
    cancelled: false,
    cancelledAt: 0n
  }
}

const thirdMockDeal = {
  id: 3n,
  offerId: 1n,
  client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
  provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  resourceId: 3n,
  totalPayment: 0n,
  blockedBalance: 100n,
  terms: {
    pricePerSecond: 1n,
    minDealDuration: 1n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
  },
  status: {
    active: false,
    createdAt: 4n,
    acceptedAt: 4n,
    billingStart: 4n,
    cancelled: true,
    cancelledAt: 6n
  }
}

async function populateDealEvent(dealEvent: any, provider: string, amount: number, chainId: number, blockTimestamp: number) {
  for (let i = 0; i < amount; i++) {
    const copyDeal = structuredClone(mockDeal)
    copyDeal.id = BigInt(i)
    copyDeal.provider = provider
    await ProvidersController.upsertProvider(provider, 1, undefined, JSON.stringify({metadata: "metadata"}), "PubKey")
    await DealsController.upsertDeal(DealsController.formatDeal(copyDeal), chainId)

    const copyEvent = structuredClone(dealEvent)
    copyEvent.transactionHash = i.toString()
    copyEvent["args"]["_dealId"] = BigInt(i)

    await EventsController.upsertEvent(EventsController.formatEvent(copyEvent), chainId, blockTimestamp)
  }
}

beforeAll(async () => {
  db = await connectToMongodb()
  await resetSequelizeDB()

  for (let i = 0; i < 2; i++) {
    await Chain.create({
      chainId: i,
      name: "Chain"
    })
  }

  await ProvidersController.upsertProvider(mockDeal.provider, 1, undefined, JSON.stringify({metadata: "metadata"}), "PubKey")

  await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)
  await DealsController.upsertDeal(DealsController.formatDeal(secondMockDeal), 1)
  await DealsController.upsertDeal(DealsController.formatDeal(thirdMockDeal), 1)
})

afterAll(async () => {
  await db.close()
  await sequelize.close()
})

afterEach(async () => {
  await eventsCollection.drop()
})

describe("Events Controller", () => {

  test("Format event", async () => {
    const result = EventsController.formatEvent(dealCollectedMockEvent)
    expect(result.blockNumber).toBe("2")
    expect(result.args._marketplaceId).toBe("1")
  })

  test("Insert event", async () => {
    const formattedEvent = EventsController.formatEvent(dealCollectedMockEvent)
    await EventsController.upsertEvent({...formattedEvent}, 1, 1695768292)
    const events = await EventsController.getEvents()
    expect(events.length).toBe(1)
    // expect(events[0]).toEqual({...formattedEvent, provider: mockDeal.provider, timestamp: 1695768292, chainId: 1})
  })

  test("Calculate provider revenue", async () => {
    await populateDealEvent(dealCollectedMockEvent, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 50, 0, 1)

    const result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0, 0, 2)
    expect(result).toBe(50n*BigInt(dealCollectedMockEvent.args._paymentToProvider))
  })

  test("Calculate provider revenue with multiple chains", async () => {
    await populateDealEvent(dealCollectedMockEvent,"0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 50, 0, 1)
    await populateDealEvent(dealCollectedMockEvent,"0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 20, 1, 1)

    let result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0, 0, 1)
    expect(result).toBe(50n*BigInt(dealCollectedMockEvent.args._paymentToProvider))

    result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1, 0, 1)
    expect(result).toBe(20n*BigInt(dealCollectedMockEvent.args._paymentToProvider))
  })

  test("Get deals created given date range", async () => {
    await populateDealEvent(dealCreatedMockEvent,"Provider", 5, 1, 0)
    await populateDealEvent(dealCreatedMockEvent,"Provider", 5, 1, 1)
    await populateDealEvent(dealCreatedMockEvent,"Provider", 5, 1, 2)
    await populateDealEvent(dealCreatedMockEvent,"Provider", 5, 1, 3)

    const allRange = await EventsController.calculateProviderNewDeals("Provider", 1, 0, 3)
    expect(allRange).toBe(20)

    const range = await EventsController.calculateProviderNewDeals("Provider", 1, 1, 2)
    expect(range).toBe(10)
  })

  test("Delete useless events for future revenue with auto accept", () => {
    const events = [
      {eventName: "DealCreated"},
      {eventName: "AddedBalance"},
      {eventName: "DealCancelled"},
    ]
    const result = EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
    expect(result).toStrictEqual([])
  })

  test("Delete useless events for future revenue without auto accept", () => {
    const events = [
      {eventName: "DealCreated"},
      {eventName: "DealCollected"},
      {eventName: "AddedBalance"},
      {eventName: "DealAccepted"},
    ]
    const result = EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
    expect(result).toStrictEqual([{eventName: "DealAccepted"}])
  })

  test("If last event is collected, no event for future revenue should be evaluated", () => {
    const events = [
      {eventName: "DealCreated"},
      {eventName: "DealAccepted"},
      {eventName: "DealCollected"},
    ]

    const result = EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
    expect(result).toStrictEqual([])
  })

  test("Calculate future revenue for deal", async () => {
    const events = await eventsCollection.find({
      chainId: 11155111,
      "args._dealId": "82"
    }).toArray()

    const result = EventsController.deleteUselessEvents(events, (a, b) => a.eventName === b)
    console.log(result)
  })

  test("Get provider revenue daily", async () => {
    const result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1, 1, 5)
    console.log(result)
    //expect(result["1970-01-01"]).toBe(5n )
  })

  test("Get provider revenue in a week", async () => {
    //Override deals
    const firstDeal = {
      id: 1n,
      offerId: 1n,
      client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
      provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
      resourceId: 3n,
      totalPayment: 0n,
      //5 days
      blockedBalance: 432000n,
      terms: {
        pricePerSecond: 1n,
        minDealDuration: 1n,
        billFullPeriods: false,
        singlePeriodOnly: false,
        metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
      },
      status: {
        active: true,
        // 18/06/2024 10hs
        createdAt: 1718715600n,
        acceptedAt: 1718715600n,
        billingStart: 1718715600n,
        cancelled: false,
        cancelledAt: 0n
      }
    }

    const secondDeal = {
      id: 2n,
      offerId: 1n,
      client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
      provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
      resourceId: 3n,
      totalPayment: 0n,
      //Active for 1.5 days
      blockedBalance: 129600n,
      terms: {
        pricePerSecond: 1n,
        minDealDuration: 1n,
        billFullPeriods: false,
        singlePeriodOnly: false,
        metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
      },
      status: {
        active: true,
        // 19/06/2024 10hs
        createdAt: 1718802000n,
        // 20/06/2024 10hs
        acceptedAt: 1718888400n,
        billingStart: 1718888400n,
        cancelled: false,
        cancelledAt: 0n
      }
    }

    const thirdDeal = {
      id: 3n,
      offerId: 1n,
      client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
      provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
      resourceId: 3n,
      totalPayment: 0n,
      // Week
      blockedBalance: 604800n,
      terms: {
        pricePerSecond: 1n,
        minDealDuration: 1n,
        billFullPeriods: false,
        singlePeriodOnly: false,
        metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
      },
      status: {
        active: false,
        // 19/06/2024 10hs
        createdAt: 1718802000n,
        acceptedAt: 1718802000n,
        billingStart: 1718802000n,
        cancelled: true,
        // 21/06/2024 18hs
        cancelledAt: 1719003600n
      }
    }

    await DealsController.upsertDeal(DealsController.formatDeal(firstDeal), 1)
    await DealsController.upsertDeal(DealsController.formatDeal(secondDeal), 1)
    await DealsController.upsertDeal(DealsController.formatDeal(thirdDeal), 1)

    // From 15/06/2024 10hs to 22/06/2024 10hs
    const result = await EventsController.calculateProviderRevenue("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1, 1718456400, 1719061200)
    console.log(result)
  })

  test("Get account events with default page and page size", async () => {
    await populateDealEvent(dealCreatedMockEvent, "Provider", 200, 1, 10000)

    const result = await EventsController.getAccountEvents("Provider", 1)
    expect(result.length).toBe(100)
  })

  test("Get account event with given page and page size", async () => {
    await populateDealEvent(dealCollectedMockEvent, "Provider", 200, 1, 10000)

    let result = await EventsController.getAccountEvents("Provider", 1, 1, 75)
    expect(result.length).toBe(75)

    result = await EventsController.getAccountEvents("Provider", 1, 2, 75)
    expect(result.length).toBe(75)

    result = await EventsController.getAccountEvents("Provider", 1, 3, 75)
    expect(result.length).toBe(50)
  })
})