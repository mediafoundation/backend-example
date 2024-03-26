import {OffersController} from "../../database/controllers/offersController"
import {resetDB} from "../../database/utils"
import {BandwidthLimit} from "../../database/models/BandwidthLimit"
import {OfferMetadata} from "../../database/models/offers/OffersMetadata"
import {NodeLocation} from "../../database/models/NodeLocation"
import {Chain} from "../../database/models/Chain"

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

describe("Offer Controller", () => {

  beforeAll(async () => {
    await resetDB()
    
    await Chain.create({
      chainId: 1,
      name: "Ganache"
    })
  })

  test("should create or update an offer", async () => {
    const formattedOffer = OffersController.formatOffer(mockOffer)

    const result = await OffersController.upsertOffer(formattedOffer, 1)
    
    console.log(result)

    expect(result.offer).not.toBeNull()
  })

  test("get offer", async () => {
    const nullDeal = await OffersController.getOfferByIdAndChain(2, 1)

    expect(nullDeal).toBeNull()

    const offer = await OffersController.getOfferByIdAndChain(7, 1)

    expect(offer!.offer.offerId).toBe(7)

    expect(offer!.metadata).not.toBeNull()
    expect(offer!.nodeLocations).not.toBeNull()
    expect(offer!.bandwidthLimit).not.toBeNull()

    expect(offer!.nodeLocations.length).toBe(4)
    expect(offer!.nodeLocations[0]).toBe("NNN")
  })

  test("filter offers, expecting no matching criteria", async () => {
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

  test("filter offers, expecting matching criteria", async () => {
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

  test("delete offer", async () => {
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
    expect(nodeLocations.length).toBe(4)
  })
})