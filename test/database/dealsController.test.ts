import {DealsController} from "../../database/controllers/dealsController"
import {ResourcesController} from "../../database/controllers/resourcesController"
import {resetDB} from "../../database/utils"
import {DealMetadata} from "../../database/models/deals/DealsMetadata"
import {BandwidthLimit} from "../../database/models/BandwidthLimit"
import {NodeLocation} from "../../database/models/NodeLocation"
import {Chain} from "../../database/models/Chain"

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
  label: "Testing Backend",
  protocol: "http",
  origin: "localhost",
  path: "/var/www/html",
}

beforeAll(async () => {
  await resetDB()
  await Chain.create({
    chainId: 1,
    name: "Ganache"
  })
})

/*afterAll(async () => {
  await Deal.drop();
  await Resource.drop();
})*/

describe("Deal Controller", () => {

  test("should create or update a deal", async () => {

    await ResourcesController.upsertResource(mockResource)

    const formattedDeal = DealsController.formatDeal(mockDeal)

    const result = await DealsController.upsertDeal(formattedDeal, 1)

    expect(result.deal).not.toBeNull()
  })

  test("get deal", async () => {
    const nullDeal = await DealsController.getDealByIdAndChain(2, 1)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.getDealByIdAndChain(1, 1)

    console.log(deal)

    expect(deal!.deal.id).toBe(1)

    expect(deal!.metadata).not.toBeNull()
    expect(deal!.nodeLocations).not.toBeNull()
    expect(deal!.bandwidthLimit).not.toBeNull()

    expect(deal!.nodeLocations.length).toBe(3)
    expect(deal!.nodeLocations[0]).toBe("ABB")
  })

  test("filter deals, expecting no matching criteria", async () => {
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

    let deal = await DealsController.getDeals(dealFilter, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals({}, metadataFilter, {}, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals({}, {}, bandwidthFilter, {}, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals({}, {}, {}, nodeLocationFilter, 1, 10)

    expect(deal.length).toBe(0)

    deal = await DealsController.getDeals({}, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(1)
  })

  test("filter deals, expecting matching criteria", async () => {
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

    let deal = await DealsController.getDeals(dealFilter, {}, {}, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals({}, metadataFilter, {}, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals({}, {}, bandwidthFilter, {}, 1, 10)

    expect(deal.length).toBe(1)

    deal = await DealsController.getDeals({}, {}, {}, nodeLocationFilter, 1, 10)

    console.log(deal)

    expect(deal.length).toBe(1)
  })

  test("delete deal", async () => {
    const nullDeal = await DealsController.deleteDealById(2)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.deleteDealById(1)


    const bandwidthLimit = await BandwidthLimit.findAll()
    const nodeLocations = await NodeLocation.findAll()
    const metadata = await DealMetadata.findAll()

    expect(metadata.length).toBe(0)
    expect(bandwidthLimit.length).toBe(0)
    expect(nodeLocations.length).toBe(3)
    expect(deal!.id).toBe(1)
    expect(await deal!.getNodeLocations()).toStrictEqual([])
  })
})
