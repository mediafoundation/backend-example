// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {Sdk, MarketplaceViewer, Resources, validChains} from "media-sdk"
import {DealsController} from "./database/controllers/dealsController"
import {ResourcesController} from "./database/controllers/resourcesController"
import {resetDB} from "./database/utils"
import {z} from "zod"
import {OffersController} from "./database/controllers/offersController"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

const init = async (chain: any) => {
  const sdkInstance = new Sdk({chain: chain})

  const marketplaceViewer: MarketplaceViewer = new MarketplaceViewer(sdkInstance)
  const resourcesInstance: Resources = new Resources(sdkInstance)

  const resources = await resourcesInstance.getAllResourcesPaginating({address: process.env.userAddress, start: 0, end: 10})

  const deals = await marketplaceViewer.getAllDealsPaginating({
    marketplaceId: process.env.MARKETPLACE_ID,
    address: process.env.userAddress,
    isProvider: true
  })

  const offers = await marketplaceViewer.getAllOffersPaginating({marketplaceId: process.env.MARKETPLACE_ID, start: 0, steps: 10})
  
  for (const offer of offers) {
    try{
      await OffersController.upsertOffer(OffersController.formatOffer(offer))
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        console.log("Offer Id: ", offer.id)
        console.log(e)
      } else {
        console.log("Offer Id: ", offer.id)
        console.error("Unknown error", e.message, "With offer", offer)
      }
    }
  }

  if(deals.length !== 0 && resources.length !== 0) {
    /*let resourcesWithoutDeal = resourcesNotMatchingDeal(resources.map((resource: any) => resource.id), deals.map((deal: any) => deal.resourceId))
        resources = resources.filter((resource: any) => !resourcesWithoutDeal.includes(resource.id))*/
    for (const resource of resources) {
      try{
        console.log(resource)
        await ResourcesController.upsertResource(resource)
      }catch (e) {
        console.log("Error for resource", resource.id, e)
      }

    }
  }

  if(deals.length !== 0) {
    //deals = deals.filter((deal: any) => deal.status.active == true)
    for (const deal of deals) {
      console.log(deal)
      try{
        const formattedDeal = DealsController.formatDeal(deal)

        await DealsController.upsertDeal(formattedDeal, chain.network)

      } catch (e: any) {
        if (e instanceof z.ZodError) {
          console.log("Deal Id: ", deal.id)
          console.error(e)
        } else {
          console.log("Deal Id: ", deal.id)
          console.error("Unknown error", e.message, "With deal", deal)
        }
      }
    }
  }
}

async function start() {
  const validChainKeys = Object.keys(validChains)
  await resetDB()
  try{
    for (const chain of validChainKeys) {
      await init(validChains[chain])
      console.log("Initialized on chain: ", validChains[chain].network)
    }
  } catch (e){
    console.log("Error", e)
  }
}

start()
