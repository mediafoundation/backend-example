import {Sdk, MarketplaceViewer, Resources, validChains, Marketplace, http} from "media-sdk"
import {DealsController} from "./database/controllers/dealsController"
import {ResourcesController} from "./database/controllers/resourcesController"
import {resetSequelizeDB} from "./database/utils"
import {z} from "zod"
import {OffersController} from "./database/controllers/offersController"
import {Chain} from "./database/models/Chain"
import {closeMongoDB, sequelize} from "./database/database"
import {httpNetworks} from "./networks"
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

const init = async (chain: any) => {
  const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
  const sdkInstance = new Sdk({chain: chain, transport: transports})
  
  const marketplaceViewer: MarketplaceViewer = new MarketplaceViewer(sdkInstance)
  const resourcesInstance: Resources = new Resources(sdkInstance)
  
  const providerAddresses: Array<string> = []
  
  // Add chain to db
  await Chain.findOrCreate({where: {chainId: chain.id}, defaults: {chainId: chain.id, name: chain.name}})
  
  const offers = await marketplaceViewer.getAllOffersPaginating({
    marketplaceId: process.env.MARKETPLACE_ID!,
    start: 0,
    steps: 10
  })
  
  for (const offer of offers) {
    try {
      const offerFormatted = OffersController.formatOffer(offer)
      const providerData = await (new Marketplace(sdkInstance)).getProvider({
        marketplaceId: Number(process.env.MARKETPLACE_ID),
        provider: offerFormatted.provider
      })
      await OffersController.upsertOffer(offerFormatted, chain.id, providerData.metadata, providerData.publicKey)
      providerAddresses.push(offerFormatted.provider)
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
  
  // Clear data on providerAddresses
  providerAddresses.filter((item, index) => providerAddresses.indexOf(item) === index)
  
  // Loop on provider addresses and get its resources and deals
  
  for (const providerAddress of providerAddresses) {
    try {
      const resources = await resourcesInstance.getAllResourcesPaginating({address: providerAddress})

      for (const resource of resources) {
        try {
          const formattedResource = ResourcesController.formatResource(resource)
          await ResourcesController.upsertResource(formattedResource, chain.id)
        } catch (e) {
          console.log("Error for resource", resource.id, e)
        }
      }
    } catch (e) {
      console.log("Error getting resources", e)
    }

    const deals = await marketplaceViewer.getAllDealsPaginating({
      marketplaceId: process.env.MARKETPLACE_ID!,
      address: providerAddress,
      isProvider: true
    })
    
    for (const deal of deals) {
      try {
        const formattedDeal = DealsController.formatDeal(deal)
        await DealsController.upsertDeal(formattedDeal, chain.id)
        
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
  const args = process.argv.slice(2)
  const shouldReset = args.includes("--reset")
  if(shouldReset) {
    await resetSequelizeDB()
  }
  try {
    const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      await init(chain)
      console.log("Initialized on chain: ", chain.name)
    }
    await sequelize.close()
    await closeMongoDB()
  } catch (e) {
    console.log("Error", e)
  }
}
  
start()
