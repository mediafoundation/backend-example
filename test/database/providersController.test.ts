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

afterEach(async () => {
  await Provider.sync({force: true})
  await ProvidersMetadata.sync({force: true})
  await ChainProvider.sync({force: true})
  await ChainClient.sync({force: true})
  await Deal.sync({force: true})
  await Offer.sync({force: true})
})

afterAll(async () => {
  await sequelize.close()
  await closeMongoDB()
})

describe("Providers Controller", () => {

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

  test("Get provider", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Account 1", 1, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("Account 1", 0, undefined, metadata, "pubKey")

    const result = await ProvidersController.getProviders()

    expect(result.length).toBe(1)
    expect(result[0].account).toBe("Account 1")
    //expect(result[0].Chains).toStrictEqual([0, 1])
  })

  test("Get provider by chainId", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Account 1", 1, undefined, metadata, "pubKey")
    await ProvidersController.upsertProvider("Account 1", 0, undefined, metadata, "pubKey")

    const result = await ProvidersController.getProviders([1])
    expect(result.length).toBe(1)
    expect(result[0].account).toBe("Account 1")
    //expect(result[0].Chains).toStrictEqual([1])
  })

  test("Get all providers when no pagination given", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    for (let i = 0; i < 100; i++) {
      await ProvidersController.upsertProvider(`Account: ${i}`, 1, undefined, metadata, "pubKey")
    }

    const providers = await ProvidersController.getProviders()

    expect(providers.length).toStrictEqual(100)
    expect(providers[0].account).toStrictEqual("Account: 0")
    expect(providers[13].account).toStrictEqual("Account: 13")
    expect(providers[99].account).toStrictEqual("Account: 99")
  })

  test("Get providers paginating", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    for (let i = 0; i < 100; i++) {
      await ProvidersController.upsertProvider(`Account: ${i}`, 1, undefined, metadata, "pubKey")
    }

    const firstPageProviders = await ProvidersController.getProviders([1], 1, 20)

    expect(firstPageProviders.length).toStrictEqual(20)
    expect(firstPageProviders[0].account).toStrictEqual("Account: 0")
    expect(firstPageProviders[13].account).toStrictEqual("Account: 13")
    expect(firstPageProviders[19].account).toStrictEqual("Account: 19")

    const thirdPageProviders = await ProvidersController.getProviders([1], 3, 10)

    expect(thirdPageProviders.length).toStrictEqual(10)
    expect(thirdPageProviders[0].account).toStrictEqual("Account: 20")
    expect(thirdPageProviders[5].account).toStrictEqual("Account: 25")
    expect(thirdPageProviders[9].account).toStrictEqual("Account: 29")
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
      1: 100
    })
  })

  test("Count offers", async () => {
    await populateOffers(15, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 0)
    await populateOffers(32, "0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31", 1)
    const countDeals = await ProvidersController.countOffers("0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31")

    expect(countDeals).toStrictEqual({
      0: 15,
      1: 32
    })
  })

  test("Count clients having only in one chain", async () => {
    const metadata = JSON.stringify({"metadata": "someExample"})
    await ProvidersController.upsertProvider("Provider 1", 1, undefined, metadata, "pubKey")
    await populateDeals(10, "Provider 1", "Client 1", 1)
    await populateDeals(10, "Provider 1", "Client 2", 1)

    const result = await ProvidersController.countClients("Provider 1")

    expect(result).toStrictEqual({
      0: 0,
      1: 2
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
      1: 2
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