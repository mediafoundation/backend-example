import {resetSequelizeDB} from "../../database/utils"
import {ProvidersController} from "../../database/controllers/providersController"
import {Chain} from "../../database/models/Chain"
import {Provider} from "../../database/models/Providers/Provider"
import {ChainProvider} from "../../database/models/manyToMany/ChainProvider"
import {DealsController} from "../../database/controllers/dealsController"
import {OffersController} from "../../database/controllers/offersController"
import {Deal} from "../../database/models/deals/Deal"
import {Offer} from "../../database/models/offers/Offer"
import {ChainClient} from "../../database/models/manyToMany/ChainClient"
import {closeMongoDB, sequelize} from "../../database/database"
import {ProvidersMetadata} from "../../database/models/Providers/ProvidersMetadata"
import { Rating } from "../../database/models/Rating"
import { Client } from "../../database/models/Clients/Client"

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

const mockOffer = {
  id: 7n,
  provider: "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31",
  publicKey: "ZQkZyAgdXpLKus918lXHTP9y9q3m8ddcUkYGSImiXxQ=",
  maximumDeals: 2000n,
  autoAccept: false,
  terms: {
    pricePerSecond: 578703703704n,
    minDealDuration: 2592000n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: "{\"autoSsl\":true,\"customCnames\":true,\"nodeLocations\":[\"NNN\",\"SRR\",\"EEE\", \"NNN\"],\"burstSpeed\":2000,\"apiEndpoint\":\"https://api.media.network/\",\"bandwidthLimit\":{\"period\":\"monthly\",\"unit\":\"tb\",\"amount\":0},\"label\":\"Pro\",\"type\":\"cdn\"}"
  }
}

async function populateDeals(amount: number, provider: string, client: string, chainId: number) {
  for (let i = 0; i < amount; i++) {
    const copyDeal = structuredClone(mockDeal)

    copyDeal.id = BigInt(i)
    copyDeal.provider = provider
    copyDeal.client = client

    await DealsController.upsertDeal(DealsController.formatDeal(copyDeal), chainId)
  }
}

async function populateOffers(amount: number, provider: string, chainId: number) {
  for (let i = 0; i < amount; i++) {
    const copyOffer = structuredClone(mockOffer)

    copyOffer["id"] = BigInt(i)

    copyOffer["provider"] = provider
    const metadata = JSON.stringify({"metadata": "someExample"})

    await OffersController.upsertOffer(OffersController.formatOffer(copyOffer), chainId, metadata, "pubKey")
  }
}

beforeAll(async () => {
  await resetSequelizeDB()

  for (let i = 0; i < 2; i++) {
    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
  }
})

afterAll(async () => {
  await sequelize.close()
  await closeMongoDB()
})

describe("Providers Controller", () => {

  describe("ProvidersController.getProviders", () => {

    beforeAll(async () => {
      // Create sample providers
      for (let i = 0; i < 5; i++) {
        await Provider.create({
          account: `Account ${i}`,
          publicKey: `PublicKey ${i}`
        })

        await Client.create({
          account: `Account ${i}`
        })

        await ChainProvider.create({
          chainId: 0,
          provider: `Account ${i}`
        })

        await ChainProvider.create({
          chainId: 1,
          provider: `Account ${i}`
        })
      }

      // Create sample ratings
      for (let i = 0; i < 5; i++) {
        await Rating.create({
          provider: `Account ${i}`,
          rating: i + 1,
          client: `Account ${i}`,
          chainId: 0
        })
        if(i < 4) {
          await Rating.create({
            provider: `Account ${i}`,
            rating: i + 2,
            client: `Account ${i}`,
            chainId: 1
          })
        }
      }
    })

    afterAll(async () => {
      await Provider.sync({force: true})
      await ProvidersMetadata.sync({force: true})
      await ChainProvider.sync({force: true})
      await ChainClient.sync({force: true})
      await Deal.sync({force: true})
      await Offer.sync({force: true})
    })

    test("should return all providers when no filters are applied", async () => {
      const result = await ProvidersController.getProviders({})
      expect(result.length).toBe(5)
    })

    test("should filter providers by chainId", async () => {
      await Provider.create({account: "Account 6", publicKey: "PublicKey 6"})
      await Chain.create({chainId: 2, name: "Chain name for 2"})
      await Rating.create({
        provider: "Account 6",
        rating: 2,
        client: "Account 3",
        chainId: 2
      })
      await ChainProvider.create({
        provider: "Account 6",
        chainId: 2
      })
      const result = await ProvidersController.getProviders({chainId: [2]})
      expect(result.length).toBe(1)
      expect(result[0].Ratings![0].chainId).toBe(2)
    })

    test("should filter providers by account", async () => {
      const result = await ProvidersController.getProviders({account: "Account 1"})
      expect(result.length).toBe(1)
      expect(result[0].account).toBe("Account 1")
    })

    test("should filter providers by minRating", async () => {
      const result = await ProvidersController.getProviders({minRating: 3})
      console.log(result.map(r => r.Ratings))
      console.log((await ProvidersController.getProviders({})).map(r => r.Ratings))
      console.log((await ProvidersController.getProviders({})).map(r => r.account))
      expect(result.length).toBe(3)
      //expect().toBeGreaterThanOrEqual(3)
      result[0].Ratings!.map(rating => {
        expect(rating.rating).toBeGreaterThanOrEqual(3)
      })
    })

    test("should paginate providers", async () => {
      const result = await ProvidersController.getProviders({page: 1, pageSize: 2})
      expect(result.length).toBe(2)
      expect(result[0].account).toBe("Account 0")
      expect(result[1].account).toBe("Account 1")
    })

    test("should combine filters and pagination", async () => {
      const result = await ProvidersController.getProviders({chainId: [1], minRating: 2, page: 1, pageSize: 2})
      expect(result.length).toBe(2)
      result[0].Ratings!.map(rating => {
        expect(rating.rating).toBeGreaterThanOrEqual(2)
      })
    })
  })

  test("Upsert provider", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    const secondMetadata = JSON.stringify({"metadata": "someExample2"})
    let result = await ProvidersController.upsertProvider("Account 1", 1, undefined, metadata, "pubKey")
    let metadataResult = await ProvidersController.getMetadata("Account 1", [1])

    expect(result.instance).not.toBeNull()
    expect(result.instance.account).toBe("Account 1")
    expect(result.created).toBe(true)
    expect(metadataResult).not.toBeNull()
    expect(metadataResult!.metadata).toBe(metadata)

    result = await ProvidersController.upsertProvider("Account 1", 1, undefined, secondMetadata, "pubKey")
    metadataResult = await ProvidersController.getMetadata("Account 1", [1])
    expect(result.instance).not.toBeNull()
    expect(result.instance.account).toBe("Account 1")
    expect(result.created).toBe(false)
    expect(metadataResult).not.toBeNull()
    expect(metadataResult!.metadata).toBe(secondMetadata)
    expect(await ProvidersMetadata.count()).toBe(1)
  })

  test("Count deals", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1, undefined, metadata, "pubKey")
    await populateDeals(20, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", "Client 1", 0)
    await populateDeals(100, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", "Client 1", 1)
    const countDeals = await ProvidersController.countDeals("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31")

    expect(countDeals).toStrictEqual({
      0: 20,
      1: 100,
      2: 0
    })
  })

  test("Count offers", async () => {
    await populateOffers(15, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0)
    await populateOffers(32, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1)
    const countDeals = await ProvidersController.countOffers("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31")

    expect(countDeals).toStrictEqual({
      0: 15,
      1: 32,
      2: 0
    })
  })

  test("Count clients having only in one chain", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Provider 1", 1, undefined, metadata, "pubKey")
    await populateDeals(10, "Provider 1", "Client 1", 1)
    await populateDeals(10, "Provider 1", "Client 2", 1)

    const result = await ProvidersController.countClients("Provider 1")

    expect(result).toStrictEqual({
      0: 1,
      1: 2,
      2: 0
    })
  })

  test("Count clients across different chains", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Provider 1", 0, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("Provider 1", 1, undefined, metadata, "pubKey")
    await populateDeals(5, "Provider 1", "Client 1", 0)
    await populateDeals(10, "Provider 1", "Client 1", 1)
    await populateDeals(5, "Provider 1", "Client 2", 1)

    const result = await ProvidersController.countClients("Provider 1")
    expect(result).toStrictEqual({
      0: 1,
      1: 2,
      2: 0
    })

    const clientsOnChain = await ProvidersController.countClients("Provider 1", [1])
    expect(clientsOnChain).toBe(2)
  })

  test("Get new clients on period", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Provider 1", 0, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("Provider 1", 1, undefined, metadata, "pubKey")
    await populateDeals(5, "Provider 1", "Client 1", 0)
    await populateDeals(10, "Provider 1", "Client 1", 1)
    await populateDeals(5, "Provider 1", "Client 2", 1)

    const result = await ProvidersController.getProviderNewClients("Provider 1", [1])
    console.log(result)
  })

  test("Get active clients", async() => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Provider 1", 0, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("Provider 1", 1, undefined, metadata, "pubKey")
    await populateDeals(5, "Provider 1", "Client 1", 0)
    await populateDeals(10, "Provider 1", "Client 1", 1)
    await populateDeals(5, "Provider 1", "Client 2", 1)

    const result = await ProvidersController.getProviderActiveClients("Provider 1")
    console.log(result)
  })
})