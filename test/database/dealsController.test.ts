import {DealsController} from "../../database/controllers/dealsController"
import {ResourcesController} from "../../database/controllers/resourcesController"
import {resetDB} from "../../database/utils"
import {DealMetadata} from "../../database/models/deals/DealsMetadata"
import {BandwidthLimit} from "../../database/models/BandwidthLimit"
import {NodeLocation} from "../../database/models/NodeLocation"
import {Chain} from "../../database/models/Chain"
import {Deal} from "../../database/models/deals/Deal"
import {Resource} from "../../database/models/Resource"

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

const mockResource = {
  id: 3n,
  owner: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  encryptedData: "{\"encryptedData\": \"Some data encrypted\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
  encryptedSharedKey: "Some shared Key",
}

async function overPopulateDb(chainId: number) {
  for (let i = 0; i < 100; i++) {
    const mockDealCopy = structuredClone(mockDeal)
    mockDealCopy.id = BigInt(i)
    const dealFormatted = DealsController.formatDeal(mockDealCopy)
    await DealsController.upsertDeal(dealFormatted, chainId)
  }
}

beforeAll(async () => {
  await resetDB()
  
  for (let i = 0; i < 5; i++) {
    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
  }
  await Resource.create({...ResourcesController.formatResource(mockResource), chainId: 1})
  await Resource.create({...ResourcesController.formatResource(mockResource), chainId: 2})
})

afterEach(async () => {
  await Deal.sync({force: true})
  await NodeLocation.sync({force: true})
})

describe("Deal Controller", () => {

  test("should create or update a deal", async () => {

    const formattedDeal = DealsController.formatDeal(mockDeal)

    const result = await DealsController.upsertDeal(formattedDeal, 1)

    expect(result.deal).not.toBeNull()
  })

  test("get deal", async () => {
    await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)
    const nullDeal = await DealsController.getDealByIdAndChain(2, 1)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.getDealByIdAndChain(1, 1)

    expect(deal!.deal.id).toBe(1)

    expect(deal!.metadata).not.toBeNull()
    expect(deal!.nodeLocations).not.toBeNull()
    expect(deal!.bandwidthLimit).not.toBeNull()

    expect(deal!.nodeLocations.length).toBe(3)
    expect(deal!.nodeLocations[0]).toBe("ABB")
  })

  test("filter deals, expecting no matching criteria", async () => {
    await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)

    const metadataFilter = {
      apiEndpoint: "Endpoint"
    }

    const dealFilter = {
      singlePeriodOnly: true
    }

    const bandwidthFilter = {
      amount: 1,
      unit: "tb",
      period: "daily"
    }

    const nodeLocationFilter = {
      location: "ABBC"
    }

    let deal = await DealsController.getDeals(1, dealFilter, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals(1, {}, metadataFilter, {}, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals(1, {}, {}, bandwidthFilter, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals(1, {}, {}, {}, nodeLocationFilter, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals(1, {}, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(1)
  })

  test("filter deals, expecting matching criteria", async () => {
    await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)

    const metadataFilter = {
      apiEndpoint: "http:localhost:5000/"
    }

    const dealFilter = {
      singlePeriodOnly: false
    }

    const bandwidthFilter = {
      amount: 1,
      unit: "tb",
      period: "monthly"
    }

    const nodeLocationFilter = {
      location: "ABB"
    }

    let deal = await DealsController.getDeals(1, dealFilter, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals(1, {}, metadataFilter, {}, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals(1, {}, {}, bandwidthFilter, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals(1, {}, {}, {}, nodeLocationFilter, 1, 10)

    expect(deal.length).toBe(1)
  })

  test("delete deal", async () => {
    await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)

    const nullDeal = await DealsController.deleteDealById(2, 1)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.deleteDealById(1, 1)


    const bandwidthLimit = await BandwidthLimit.findAll()
    const nodeLocations = await NodeLocation.findAll()
    const metadata = await DealMetadata.findAll()

    expect(metadata.length).toBe(0)
    expect(bandwidthLimit.length).toBe(0)
    expect(nodeLocations.length).toBe(3)
    expect(deal!.id).toBe(1)
    expect(await deal!.getNodeLocations()).toStrictEqual([])
  })
  
  test("same deal id but on different networks should not be updated", async () => {
    const firstResult = await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)
    expect(firstResult.deal.chainId).toBe(1)
    
    let deals = await Deal.findAll()
    expect(deals.length).toBe(1)
    const secondResult = await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 2)
    expect(secondResult.deal.chainId).toBe(2)
    
    deals = await Deal.findAll()
    expect(deals.length).toBe(2)
  })
  
  test("Update first deal on chain 1", async () => {
    /*mockDeal["provider"] = "Some new provider"
    const updatedDeal = await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 1)
    
    expect(updatedDeal.deal.provider).toBe("Some new provider")
    expect((await Deal.findAll()).length).toBe(2)
    expect((await DealsController.getDealByIdAndChain(1, 2))?.deal.provider).toBe("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31")*/
  })
  
  test("Delete deal on second chain", async() => {
    await DealsController.upsertDeal(DealsController.formatDeal(mockDeal), 2)
    const result = await DealsController.deleteDealById(1, 2)

    expect((await Deal.findAll()).length).toBe(0)
    expect(result?.dealId).not.toBeNull()
  })
  
  test("Absent resource gives null value", async () => {
    const noValidResourceDeal = {
      id: 100n,
      offerId: 1n,
      client: "0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B",
      provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
      resourceId: 0n,
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
    
    const deal = await DealsController.upsertDeal(DealsController.formatDeal(noValidResourceDeal), 1)
    
    expect(deal.deal.resourceId).toBeNull()
  })

  test("Get deals with no pagination retrieve all deals in db", async () => {

    await overPopulateDb(1)

    let deals = await DealsController.getDeals()
    expect(deals.length).toBe(100)

    await overPopulateDb(2)

    deals = await DealsController.getDeals()
    expect(deals.length).toBe(200)
  })

  test("Get deals with no pagination specifying chainId", async () => {
    await overPopulateDb(1)

    let deals = await DealsController.getDeals(1)
    expect(deals.length).toBe(100)

    deals = await DealsController.getDeals(2)
    expect(deals.length).toBe(0)
  })

  test("Get deals paginating", async () => {
    await overPopulateDb(1)

    let deals = await DealsController.getDeals(undefined, {}, {}, {}, {}, 1, 30 )
    expect(deals.length).toBe(30)
    expect(deals[0].id).toBe(1)
    expect(deals[14].id).toBe(15)
    expect(deals[29].id).toBe(30)

    deals = await DealsController.getDeals(1, {}, {}, {}, {}, 3, 30 )
    expect(deals.length).toBe(30)
    expect(deals[0].id).toBe(61)
    expect(deals[14].id).toBe(75)
    expect(deals[29].id).toBe(90)

    deals = await DealsController.getDeals(3, {}, {}, {}, {}, 3, 30 )
    expect(deals.length).toBe(0)
  })
})
