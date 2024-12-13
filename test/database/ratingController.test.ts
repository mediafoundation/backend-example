import {resetSequelizeDB} from "../../database/utils"
import {Chain} from "../../database/models/Chain"
import {ProvidersController} from "../../database/controllers/providersController"
import {RatingController} from "../../database/controllers/ratingController"
import {Rating} from "../../database/models/Rating"
import {closeMongoDB, sequelize} from "../../database/database"

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
  await resetSequelizeDB()

  for (let i = 0; i < 5; i++) {
    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
    await ProvidersController.upsertProvider(mockDeal.provider, i, undefined, JSON.stringify({metadata: "Some metadata"}), "Pub Key")
  }
})

afterEach(async () => {
  await Rating.sync({force: true})
})

afterAll(async () => {
  await closeMongoDB()
  await sequelize.close()
})

describe("Rating Controller", () => {
  it("Rate provider", async () => {
    await RatingController.rateProvider(mockDeal.provider, 1, 1, 5)

    const rates = await Rating.findAll()

    expect(rates.length).toBe(1)
    expect(rates[0].provider).toBe(mockDeal.provider)
  })

  it("Rate provider twice overrides value", async () => {
    await RatingController.rateProvider(mockDeal.provider, 1, 1, 5)
    await RatingController.rateProvider(mockDeal.provider, 1, 1, 3)

    const rates = await Rating.findAll()

    expect(rates.length).toBe(1)
    expect(rates[0].dataValues.rating).toBe(3)
  })

  it("Gets error if rating is not between 1 and 5", async () => {
    await expect(RatingController.rateProvider(mockDeal.provider, 1, 1, 6)).rejects.toThrow("Validation error: Validation max on rating failed")
    await expect(RatingController.rateProvider(mockDeal.provider, 1, 1, 0)).rejects.toThrow("Validation error: Validation min on rating failed")
  })
  
  it("Get provider rating", async () => {
    for (let i = 0; i < 3; i++) {
      await RatingController.rateProvider(mockDeal.provider, 1, i, 4)
    }

    const rating = await RatingController.getAverageRating(mockDeal.provider, [1, 2, 3, 4])

    expect(rating[1]).toBe(4)
    expect(rating[2]).toBe(4)
    expect(rating[3]).toBeNull()
    expect(rating[4]).toBeNull()
  }, 10000)
})