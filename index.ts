// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {Sdk, MarketplaceViewer, Resources, Encryption, validChains} from "media-sdk"
import {DealsController} from "./database/controllers/dealsController"
import {ResourcesController} from "./database/controllers/resourcesController"
import {resetDB} from "./database/utils"
import {z} from "zod"
import {OffersController} from "./database/controllers/offersController"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

const init = async (chain: any) => {
  const sdkInstance = new Sdk({privateKey: process.env.PRIVATE_KEY!, chain: chain})

  const marketplaceViewer: MarketplaceViewer = new MarketplaceViewer(sdkInstance)
  const resourcesInstance: Resources = new Resources(sdkInstance)

  const resources = await resourcesInstance.getAllResourcesPaginating({address: process.env.userAddress, start: 0, end: 10})

  let deals = await marketplaceViewer.getAllDealsPaginating({
    marketplaceId: 1,
    address: process.env.userAddress,
    isProvider: true
  })

  const offers = await marketplaceViewer.getAllOffersPaginating({marketplaceId: 1, start: 0, steps: 10})

  if(deals.length !== 0 && resources.length !== 0) {
    /*let resourcesWithoutDeal = resourcesNotMatchingDeal(resources.map((resource: any) => resource.id), deals.map((deal: any) => deal.resourceId))
        resources = resources.filter((resource: any) => !resourcesWithoutDeal.includes(resource.id))*/
    for (const resource of resources) {
      const attr = JSON.parse(resource.encryptedData)
      const decryptedSharedKey = await Encryption.ethSigDecrypt(
        resource.encryptedSharedKey,
        process.env.PRIVATE_KEY
      )

      const decrypted = await Encryption.decrypt(
        decryptedSharedKey,
        attr.iv,
        attr.tag,
        attr.encryptedData
      )

      const data = JSON.parse(decrypted)

      try{
        await ResourcesController.upsertResource({id: resource.id, owner: resource.owner, ...data})
      }catch (e) {
        console.log("Error for resource", resource.id, e)
      }

    }
  }

  if(deals.length !== 0) {
    deals = deals.filter((deal: any) => deal.status.active == true)
    for (const deal of deals) {
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
