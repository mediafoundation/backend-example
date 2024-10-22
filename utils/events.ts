import {Blockchain, Marketplace} from "../../media-sdk"
import {EventsController} from "../database/controllers/eventsController"
import {OffersController} from "../database/controllers/offersController"
import {DealsController} from "../database/controllers/dealsController"

export default class EventsUtils {
  static async manageOfferUpdated(event: any, marketplace: Marketplace, blockChain: Blockchain, chainId: number) {
    const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
    await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
    const offer = await marketplace.getOfferById({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      offerId: event._offerId
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
      dealId: event._dealId
    })

    await DealsController.upsertDeal(DealsController.formatDeal(deal), chainId)
  }
}