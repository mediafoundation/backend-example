import {OffersController} from "../../database/controllers/offersController"
import {resetSequelizeDB} from "../../database/utils"
import {BandwidthLimit} from "../../database/models/BandwidthLimit"
import {OfferMetadata} from "../../database/models/offers/OffersMetadata"
import {NodeLocation} from "../../database/models/NodeLocation"
import {Chain} from "../../database/models/Chain"
import {Offer} from "../../database/models/offers/Offer"
import {closeMongoDB, sequelize} from "../../database/database"

const mockOffer = {
  id: 7n,
  provider: "0xCf9d14f5ae5EfA571276958695f35f96860dB267",
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

async function overPopulateDb(chainId: number) {
  for (let i = 0; i < 100; i++) {
    const mockOfferCopy = structuredClone(mockOffer)
    mockOfferCopy.id = BigInt(i)
    const offerFormatted = OffersController.formatOffer(mockOfferCopy)
    await OffersController.upsertOffer(offerFormatted, chainId, JSON.stringify({metadata: "Some metadata"}), "PubKey")
  }
}

beforeAll(async () => {
  await resetSequelizeDB()

  for (let i = 0; i < 5; i++) {

    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
  }
})

afterAll(async () => {
  await closeMongoDB()
  await sequelize.close()
})

afterEach(async () => {
  await Offer.sync({force: true})
  await NodeLocation.sync({force: true})
})

describe("Offer Controller", () => {

  test("Should create or update an offer", async () => {
    const formattedOffer = OffersController.formatOffer(mockOffer)

    const result = await OffersController.upsertOffer(formattedOffer, 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")

    expect(result.offer).not.toBeNull()
  })

  test("Get offer", async () => {
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    const nullDeal = await OffersController.getOfferByIdAndChain(2, 1)

    expect(nullDeal).toBeNull()

    const offer = await OffersController.getOfferByIdAndChain(7, 1)

    expect(offer!.offer.offerId).toBe(7)

    expect(offer!.metadata).not.toBeNull()
    expect(offer!.nodeLocations).not.toBeNull()
    expect(offer!.bandwidthLimit).not.toBeNull()

    expect(offer!.nodeLocations.length).toBe(3)
    expect(offer!.nodeLocations[0]).toBe("EEE")
  })

  test("Filter offers, expecting no matching criteria", async () => {
    const metadataFilter = {"apiEndpoint": "Endpoint"}
    const nodeLocationFilter = {"location": "ABBC"}
    const bandwidthLimitFilter = {"amount": 1, "unit": "tb", "period": "daily"}

    let offers = await OffersController.getOffers(1, {}, metadataFilter, {}, {})

    expect(offers.length).toBe(0)

    offers = await OffersController.getOffers(1, {}, {}, bandwidthLimitFilter, {})

    expect(offers.length).toBe(0)

    offers = await OffersController.getOffers(1, {}, {}, {}, nodeLocationFilter)

    expect(offers.length).toBe(0)
  })

  test("Filter offers, expecting matching criteria", async () => {
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    const metadataFilter = {"autoSsl": true}
    const nodeLocationFilter = {"location": "NNN"}
    const bandwidthLimitFilter = {"amount": 0, "unit": "tb", "period": "monthly"}

    let offers = await OffersController.getOffers(1, {}, metadataFilter, {}, {})

    expect(offers.length).toBe(1)

    offers = await OffersController.getOffers(1, {}, {}, bandwidthLimitFilter, {})

    expect(offers.length).toBe(1)

    offers = await OffersController.getOffers(1, {}, {}, {}, nodeLocationFilter)

    expect(offers.length).toBe(1)
  })

  test("Delete offer", async () => {
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    const nullOffer = await OffersController.deleteOfferById(1, 1)

    expect(nullOffer).toBeNull()

    const offer = await OffersController.deleteOfferById(7, 1)

    const bandwidthLimit = await BandwidthLimit.findAll()
    const metadata = await OfferMetadata.findAll()
    const nodeLocations = await NodeLocation.findAll()

    expect(offer).not.toBeNull()
    expect(offer!.offerId).toBe(7)
    expect(bandwidthLimit.length).toBe(0)
    expect(metadata.length).toBe(0)
    expect(nodeLocations.length).toBe(3)
  })
  
  test("Same offer id but on different networks should not be updated", async () => {
    const firstResult = await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    expect(firstResult.offer.chainId).toBe(1)
    
    let offers = await Offer.findAll()
    expect(offers.length).toBe(1)
    const secondResult = await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 2, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    expect(secondResult.offer.chainId).toBe(2)
    
    offers = await Offer.findAll()
    expect(offers.length).toBe(2)
  })
  
  test("Update first deal on chain 1", async () => {
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    expect((await OffersController.getOfferByIdAndChain(7, 1))?.offer.publicKey).toBe("ZQkZyAgdXpLKus918lXHTP9y9q3m8ddcUkYGSImiXxQ=")
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 2, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    const mockOfferCopy = structuredClone(mockOffer)
    mockOfferCopy["publicKey"] = "Some new provider"
    const formattedOffer = OffersController.formatOffer(mockOfferCopy)
    const updatedOffer = await OffersController.upsertOffer(formattedOffer, 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    
    expect(updatedOffer.offer.publicKey).toBe("Some new provider")
    expect((await Offer.findAll()).length).toBe(2)
    expect((await OffersController.getOfferByIdAndChain(7, 2))?.offer.publicKey).toBe("ZQkZyAgdXpLKus918lXHTP9y9q3m8ddcUkYGSImiXxQ=")
  })
  
  test("Delete offer on second chain", async() => {
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 1, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    await OffersController.upsertOffer(OffersController.formatOffer(mockOffer), 2, JSON.stringify({metadata: "Some metadata"}), "PubKey")
    const result = await OffersController.deleteOfferById(7, 2)
    
    expect((await Offer.findAll()).length).toBe(1)
    expect(result?.offerId).not.toBeNull()
  })

  test("Get Offers with no pagination retrieve all deals in db", async () => {

    await overPopulateDb(1)

    let offers = await OffersController.getOffers()
    expect(offers.length).toBe(100)

    await overPopulateDb(2)

    offers = await OffersController.getOffers()
    expect(offers.length).toBe(200)
  })

  test("Get Offers with no pagination specifying chainId", async () => {
    await overPopulateDb(1)

    let offers = await OffersController.getOffers(1)
    expect(offers.length).toBe(100)

    offers = await OffersController.getOffers(2)
    expect(offers.length).toBe(0)
  })

  test("Get Offers paginating", async () => {
    await overPopulateDb(1)

    let offers = await OffersController.getOffers(undefined, {}, {}, {}, {}, undefined, 1, 30 )
    expect(offers.length).toBe(30)
    expect(offers[0].id).toBe(1)
    expect(offers[14].id).toBe(15)
    expect(offers[29].id).toBe(30)

    offers = await OffersController.getOffers(1, {}, {}, {}, {}, undefined, 3, 30 )
    expect(offers.length).toBe(30)
    expect(offers[0].id).toBe(61)
    expect(offers[14].id).toBe(75)
    expect(offers[29].id).toBe(90)

    offers = await OffersController.getOffers(3, {}, {}, {}, {}, undefined, 3, 30 )
    expect(offers.length).toBe(0)
  })

  /*describe("OffersController - Get Offers with Minimum Rating", () => {
    const mockOffer = {
      id: 1,
      offerId: 1,
      provider: "0xProvider1",
      publicKey: "PublicKey1",
      chainId: 1,
      maximumDeals: 1000,
      autoAccept: true,
      pricePerSecond: 1000,
      minDealDuration: 3600,
      billFullPeriods: true,
      singlePeriodOnly: false,
    }

    const mockProvider = {
      account: "0xProvider1",
      publicKey: "PublicKey1"
    }

    const mockRating = {
      provider: "0xProvider1",
      client: "0xClient1",
      chainId: 1,
      rating: 5
    }

    const mockDeal = {
      id: 1,
      dealId: 1,
      offerId: 1,
      client: "0xClient1",
      provider: "0xProvider1",
      //resourceId: 3n,
      chainId: 1,
      totalPayment: 0,
      blockedBalance: 446499999999,
      active: true,
      createdAt: 1710153976,
      acceptedAt: 1710153976,
      billingStart: 1710153976,
      cancelled: false,
      cancelledAt: 0,
      pricePerSecond: 111111111111,
      minDealDuration: 900,
      billFullPeriods: false,
      singlePeriodOnly: false,
      terms: {
        metadata: "{\"type\":\"cdn\",\"label\":\"Testing Backend\",\"apiEndpoint\":\"http:localhost:5000/\",\"bandwidthLimit\":{\"amount\":1,\"unit\":\"tb\",\"period\":\"monthly\"},\"autoSsl\":true,\"burstSpeed\":1000,\"nodeLocations\":[\"ABB\", \"CL\", \"BR\"],\"customCnames\":true}"
      },
    }

    beforeEach(async () => {
      //await resetSequelizeDB()
      await Provider.create(mockProvider)
      await Client.create({account: "0xClient1"})
      await Offer.create(mockOffer)
      await Deal.create(mockDeal)
      await Rating.create(mockRating)
    })

    test("Should return offers when provider has minimum average rating", async () => {
      const minRating = 4
      const offers1 = await Offer.findAll()
      const offers = await OffersController.getOffers(undefined, {}, {}, {}, {})
      expect(offers.length).toBeGreaterThan(0)
      expect(offers[0].provider).toBe(mockOffer.provider)
    })

    test("Should not return offers when provider does not meet minimum average rating", async () => {
      const minRating = 6
      const offers = await OffersController.getOffers(undefined, {}, {}, {}, {}, minRating)
      expect(offers.length).toBe(0)
    })
  })*/
})