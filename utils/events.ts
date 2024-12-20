import {EventsController} from "../database/controllers/eventsController"
import {OffersController} from "../database/controllers/offersController"
import {DealsController} from "../database/controllers/dealsController"
import {Blockchain, Marketplace, RatingSystem} from "media-sdk"
import {RatingController} from "../database/controllers/ratingController"

export default class EventsUtils {
  static async manageOfferUpdated(event: any, marketplace: Marketplace, blockChain: Blockchain, chainId: number) {
    const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
    await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
    const offer = await marketplace.getOfferById({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      offerId: event.args._offerId
    })

    const formattedOffer = OffersController.formatOffer(offer)

    const providerData = await marketplace.getProvider({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      provider: formattedOffer.provider
    })

    await OffersController.upsertOffer(formattedOffer, chainId, providerData.metadata, providerData.publicKey)
  }

  static async manageDealUpdated(event: any, marketplace: Marketplace, blockChain: Blockchain, chainId: number) {
    const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
    await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
    const deal = await marketplace.getDealById({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      dealId: event.args._dealId
    })

    await DealsController.upsertDeal(DealsController.formatDeal(deal), chainId)
  }

  static async manageRatingUpdated(event: any, rating: RatingSystem, blockchain: Blockchain, chainId: number) {
    const blockTimestamp = await blockchain.getBlockTimestamp(event.blockNumber)
    await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
    const providerRating = await rating.getProviderRating({
      marketplaceId: Number(process.env.MARKETPLACE_Id),
      provider: event.args._provider
    })

    await RatingController.rateProvider(event.args._provider, chainId, Number(providerRating.sum), Number(providerRating.count))
  }
}