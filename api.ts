/**
 * @file api.ts
 * @description This file contains the main API endpoints for the application.
 */

import {http, Marketplace, RatingSystem, Resources, Sdk, validChains} from "media-sdk"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import {DealsController} from "./database/controllers/dealsController"
import {ResourcesController} from "./database/controllers/resourcesController"
import {OffersController} from "./database/controllers/offersController"
import {parseFilter} from "./utils/filter"
import {createRelationsBetweenTables} from "./database/utils"
import {ProvidersController} from "./database/controllers/providersController"
import {EventsController} from "./database/controllers/eventsController"
import {ProvidersMetadata} from "./database/models/Providers/ProvidersMetadata"
import {httpNetworks} from "./networks"
import {ProviderClient} from "./database/models/manyToMany/ProviderClient"
import {ChainClient} from "./database/models/manyToMany/ChainClient"
import {Deal} from "./database/models/deals/Deal"
import {ChainProvider} from "./database/models/manyToMany/ChainProvider"
import {Op} from "sequelize"
import {RatingController} from "./database/controllers/ratingController"
import {Offer} from "./database/models/offers/Offer"
import {validateParams, ValidatorType} from "./middlewares/validation"

// Initialize express app
export const app = express()

// Middleware
app.use(bodyParser.json()) // for parsing application/json
app.use(cors()) // for enabling CORS

/**
 * @function manageIncomingFilterRequest
 * @description Manage incoming request and parse filters from query parameters
 * @param {object} req - The request object
 */
function manageIncomingFilterRequest(req: any) {
  // Parse filters from query parameters
  const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")
  // Get page number and size from filters

  const page = req.query.page ? Number(req.query.page) : undefined
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined

  // Parse individual filters

  const genericFilter = parseFilter(filters.genericFilter ? filters.genericFilter : {})
  const metadataFilter = parseFilter(filters.metadataFilter ? filters.metadataFilter : {})
  const bandwidthFilter = parseFilter(filters.bandwidthFilter ? filters.bandwidthFilter : {})
  const nodeLocationFilter = parseFilter(filters.nodeLocationFilter ? filters.nodeLocationFilter : {})
  const clientFilter = parseFilter(filters.clientFilter ? filters.clientFilter : {})
  return {
    page,
    pageSize,
    genericFilter,
    metadataFilter,
    bandwidthFilter,
    nodeLocationFilter,
    clientFilter
  }
}

/**
 * @route GET /resources
 * @description Retrieves all resources.
 */
app.get("/resources", validateParams({
  chainId: [ValidatorType.NUMBER_ARRAY_OPTIONAL, ValidatorType.NUMBER_OPTIONAL]
}), async (req, res) => {
  const chainId = req.query.chainId

  try{
    const isNumber = !isNaN(Number(chainId))
    const formattedChainId = chainId ? (isNumber ? Number(chainId) : JSON.parse(chainId as string)) : undefined
    const resources = await ResourcesController.getResources(formattedChainId)
    res.json(resources)
  } catch (e) {
    console.log("Error:", e)
    res.status(500).json({error: "Something went wrong"})
  }
})

/**
 * @route GET /deals
 * @description Retrieves deals based on provided filters, page number and page size.
 */
app.get("/deals", validateParams({
  chainId: [ValidatorType.NUMBER_OPTIONAL, ValidatorType.NUMBER_ARRAY_OPTIONAL]
}), async (req, res) => {
  const chainId = req.query.chainId

  const managedFilters = manageIncomingFilterRequest(req)

  try{
    // Get deals from DealsController
    const isNumber = !isNaN(Number(chainId))
    const formattedChainId = chainId ? (isNumber ? Number(chainId) : JSON.parse(chainId as string)) : undefined
    console.log("ChainId", formattedChainId)
    const deals = await DealsController.getDeals(formattedChainId, managedFilters.genericFilter, managedFilters.metadataFilter, managedFilters.bandwidthFilter, managedFilters.nodeLocationFilter, managedFilters.page, managedFilters.pageSize)

    // Send response
    res.json(deals)
  } catch (e) {
    console.log({error: e})
    res.status(500).json({error: "Something went wrong"})
  }
})

/**
 * @route GET /deals/:id/chainId/:chainId
 * @description Retrieves a deal by its id.
 */
app.get("/deals/:id/chainId/:chainId", validateParams({
  id: ValidatorType.NUMBER,
  chainId: ValidatorType.NUMBER
}), async (req, res) => {
  const deal = await DealsController.getDealByIdAndChain(Number(req.params.id), Number(req.params.chainId))
  res.json(deal)
})

/**
 * @route GET /offers
 * @description Retrieves offers based on provided filters, page number and page size.
 */
app.get("/offers", validateParams({
  chainId: [ValidatorType.NUMBER_OPTIONAL, ValidatorType.NUMBER_ARRAY_OPTIONAL],
  minRating: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  const chainId = req.query.chainId
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined
  const managedFilters = manageIncomingFilterRequest(req)
  try {
    const isNumber = !isNaN(Number(chainId))
    const formattedChainId = chainId ? (isNumber ? Number(chainId) : JSON.parse(chainId as string)) : undefined
    const offers = await OffersController.getOffers(formattedChainId, managedFilters.genericFilter, managedFilters.metadataFilter, managedFilters.bandwidthFilter, managedFilters.nodeLocationFilter, minRating, managedFilters.page, managedFilters.pageSize)
    res.json(offers)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Something went wrong"})
  }
})

/**
 * @route GET /providers
 * @description Retrieves providers based on provided filters, page number and page size.
 */
app.get("/providers", validateParams({
  chainId: ValidatorType.NUMBER_ARRAY_OPTIONAL,
  provider: ValidatorType.STRING_OPTIONAL,
  rating: ValidatorType.NUMBER_OPTIONAL,
  page: ValidatorType.NUMBER_OPTIONAL,
  pageSize: ValidatorType.NUMBER_OPTIONAL
}), async(req, res) => {
  try {

    const result = []

    const page = req.query.page ? Number(req.query.page) : undefined
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined
    const chainId = req.query.chainId
    const account = req.query.provider
    const rating = req.query.rating ? Number(req.query.rating) : undefined

    const isNumber = !isNaN(Number(chainId))
    const formattedChainId = chainId ? (isNumber ? Number(chainId) : JSON.parse(chainId as string)) : undefined
    const providers = await ProvidersController.getProviders({chainId : formattedChainId, page : page, pageSize : pageSize, account : account as string | undefined, minRating : rating})

    for (const provider of providers) {
      const dealsCount = await ProvidersController.countDeals(provider.account, formattedChainId)
      const offersCount = await ProvidersController.countOffers(provider.account, formattedChainId)
      const clientCount = await ProvidersController.countClients(provider.account, formattedChainId)
      let providerRating = {}
      let providerMetadata: { [index: number]: any } | ProvidersMetadata | null = {}
      let registryTime: { [index: number]: any } | number = {}


      if(chainId) {
        providerMetadata = await ProvidersController.getMetadata(provider.account, formattedChainId)
        registryTime = await ProvidersController.getProviderStartTime(provider.account, formattedChainId)
        providerRating = await RatingController.getAverageRating(provider.account, formattedChainId)
      }

      else {
        const chains = provider.Chains
        for (const chain of chains!) {
          providerMetadata![chain] = await ProvidersController.getMetadata(provider.account, [Number(chain)])
          registryTime[chain] = (await ProvidersController.getProviderStartTime(provider.account, [Number(chain)]))[chain]
          providerRating = await RatingController.getAverageRating(provider.account, chains!)
        }
      }

      const providerResult = {
        "address": provider.account,
        "chains": provider.Chains,
        "deals": dealsCount,
        "offers": offersCount,
        "clients": clientCount,
        "metadata": providerMetadata,
        "registerTime": registryTime,
        "rating": providerRating
      }

      result.push(providerResult)
    }

    res.json(result)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Something went wrong"})
  }
})

/**
 * @route GET /providers/countNewDeals
 * @description Retrieves the count of new deals for a provider.
 */
app.get("/providers/countNewDeals", validateParams({
  provider: ValidatorType.STRING,
  chainId: ValidatorType.NUMBER_ARRAY_OPTIONAL,
  from: ValidatorType.NUMBER_OPTIONAL,
  to: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  const provider = req.query.provider
  const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined
  const fromDate = req.query.from ? Number(req.query.from) : undefined
  const toDate = req.query.to ? Number(req.query.to) : undefined

  try {
    const amount = await EventsController.calculateProviderNewDeals(provider!.toString(), chainId, fromDate, toDate)

    res.json({
      "dealsCount": amount
    })
  } catch (e) {
    console.log(e)
    res.send(e)
  }

})

/**
 * @route GET /providers/totalRevenue
 * @description Retrieves the total revenue for a provider.
 */
app.get("/providers/totalRevenue", validateParams({
  provider: ValidatorType.STRING,
  chainId: [ValidatorType.NUMBER_ARRAY_OPTIONAL, ValidatorType.NUMBER_OPTIONAL],
  from: ValidatorType.NUMBER_OPTIONAL,
  to: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  try {
    const provider = req.query.provider
    const chainId = req.query.chainId
    const from: number | undefined = req.query.from ? Number(req.query.from) : undefined
    const to: number | undefined = req.query.to ? Number(req.query.to) : undefined

    const isNumber = !isNaN(Number(chainId))
    const formattedChainId: number[] = chainId ? (isNumber ? [Number(chainId)] : JSON.parse(chainId as string)) : Object.keys(validChains).map(chain => Number(chain))

    const response: {[index: number]: any} = {}
    for (const chain of formattedChainId) {
      const queryResult = await EventsController.calculateProviderRevenue(provider!.toString(), Number(chain), from, to)
      const dailyRevenue = queryResult.dailyRevenue

      const formattedData: { [key: string]: string } = {}

      for (const key in dailyRevenue) {
        const timestamp = Number(key)
        const bigNumber = dailyRevenue[key]
        formattedData[timestamp] = bigNumber.toString()
      }

      response[Number(chain)] = {
        dailyRevenue: formattedData,
        totalRevenue: queryResult.totalRevenue.toString(),
        collectedRevenue: queryResult.collectedRevenue.toString(),
        uncollectedRevenue: queryResult.uncollectedRevenue.toString()
      }
    }
    res.json(response)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /providers/countNewClients
 * @description Retrieves the count of new clients for a provider.
 */
app.get("/providers/countNewClients", validateParams({
  provider: ValidatorType.STRING,
  chainId: [ValidatorType.NUMBER_ARRAY_OPTIONAL, ValidatorType.NUMBER_OPTIONAL],
  from: ValidatorType.NUMBER_OPTIONAL,
  to: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  const provider = req.query.provider
  const chainId = req.query.chainId
  const fromTimestamp = req.query.from ? Number(req.query.from) : undefined
  const toTimestamp = req.query.to ? Number(req.query.to) : undefined

  /*if(!provider || !chainId || !Array.isArray(JSON.parse(req.query.chainId as string))) {
    res.status(500).json({error: "No provider or chainId provided"})
    return
  }*/

  const isNumber = !isNaN(Number(chainId))
  const formattedChainId: number[] = chainId ? (isNumber ? [Number(chainId)] : JSON.parse(chainId as string)) : Object.keys(validChains).map(chain => Number(chain))
  try {
    const result = await ProvidersController.getProviderNewClients(provider!.toString(), formattedChainId, fromTimestamp, toTimestamp)
    res.json({
      "clients": result
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }

})

/**
 * @route GET /providers/countActiveClients
 * @description Retrieves the count of active clients for a provider.
 */
app.get("/providers/countActiveClients", validateParams({
  provider: ValidatorType.STRING,
  chainId: [ValidatorType.NUMBER_ARRAY_OPTIONAL, ValidatorType.NUMBER_OPTIONAL],
  from: ValidatorType.NUMBER_OPTIONAL,
  to: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  const provider = req.query.provider
  const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined
  const fromTimestamp = req.query.from ? Number(req.query.from) : undefined
  const toTimestamp = req.query.to ? Number(req.query.to) : undefined

  /*if(!provider) {
    res.status(500).json({error: "No provider provided"})
    return
  }*/

  const isNumber = !isNaN(Number(chainId))
  const formattedChainId: number[] = chainId ? (isNumber ? [Number(chainId)] : JSON.parse(chainId as string)) : Object.keys(validChains).map(chain => Number(chain))

  try {
    const result = await ProvidersController.getProviderActiveClients(provider!.toString(), formattedChainId, fromTimestamp, toTimestamp)
    res.json(result)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /providerClient
 * @description Retrieves deal details for a specific provider and client.
 * @param {object} req - The request object containing query parameters.
 * @param {string} req.query.provider - The provider identifier.
 * @param {string} req.query.client - The client identifier.
 * @param {object} res - The response object.
 * @returns {JSON} - The deal details associated with the given provider and client or an error message in case of failure.
 */
app.get("/providerClient", validateParams({
  provider: ValidatorType.STRING,
  client: ValidatorType.STRING
}), async (req, res) => {
  const {provider, client} = req.query

  const formattedProvider = provider ? provider.toString() : ""
  const formattedClient = client ? client.toString() : ""

  const clientDeals: {[index: number]: { deals: Deal[], dealsCount: number }} = {}

  try {
    // Check if client and provider association exists
    await ProviderClient.findOne({
      where: {
        provider: formattedProvider,
        client: formattedClient
      },
      rejectOnEmpty: true,
    })

    const chainClient = await ChainClient.findAll({
      where: {
        client: formattedClient
      },
      raw: true
    })

    for (const chain of chainClient) {
      const deals = await Deal.findAll({
        where: {
          chainId: chain.chainId,
          client: formattedClient
        },
        raw: true
      })
      clientDeals[chain.chainId] = {
        deals: deals,
        dealsCount: deals.length
      }
    }

    res.json({
      provider: provider,
      dealDetails: clientDeals
    })
  } catch (e) {
    console.log("Error", e)
    res.json(e)
  }
})

/**
 * @route GET /allProvidersClients
 * @description Retrieves all clients and their deals for a specific provider across all chains.
 * @param {object} req - The request object containing query parameters.
 * @param {string} req.query.provider - The provider identifier.
 * @param {object} res - The response object.
 * @returns {JSON} - The clients and their deals associated with the given provider or an error message in case of failure.
 */
app.get("/allProvidersClients", validateParams({
  provider: ValidatorType.STRING
}), async (req, res) => {
  const {provider} = req.query

  const formattedProvider = provider ? provider.toString() : ""

  const response: {
    [index: string]: { //ChainId
      [index: string]: { //Client
        deals: Deal[],
        dealsCount: number
      }
    }
  } = {}

  try {

    // Check if client and provider association exists
    const providerClients = await ProviderClient.findAll({
      where: {
        provider: formattedProvider
      },
      raw: true
    })

    const clients = providerClients.map(providerClient => providerClient.client)

    const providerChain = await ChainProvider.findAll({
      where: {
        provider: formattedProvider
      },
      raw: true
    })

    for (const chain of providerChain) {
      const deals = await Deal.findAll({
        where: {
          chainId: chain.chainId,
          client: {
            [Op.in]: clients
          },
          provider: formattedProvider
        },

        attributes: {
          exclude: ["offerId"]
        },
        include: [
          {
            model: Offer,
            as: "Offer",
            attributes: ["offerId"],
          }
        ],
        nest: true,
        raw: true
      })

      const rawClient = deals.map(deal => deal.client)

      const client = [...new Set(rawClient)]
      console.log(client, chain.chainId)

      const clientsDeals: {[index: string]: {
          deals: Deal[],
          dealsCount: number
        }
      } = {}

      for (const clientElement of client) {
        const clientDeals = deals.filter(deal => deal.client === clientElement)
        clientsDeals[clientElement] = {
          deals: clientDeals,
          dealsCount: clientDeals.length
        }
      }
      response[chain.chainId] = clientsDeals
    }

    res.json({
      provider: provider,
      dealDetails: response
    })
  } catch (e) {
    console.log("Error", e)
    res.json(e)
  }
})

/**
 * @route GET /upsertOffer
 * @description This endpoint is used to update or insert an offer in the database.
 */
app.get("/upsertOffer", validateParams({
  chainId: ValidatorType.NUMBER,
  offerId: ValidatorType.NUMBER
}), async (req, res) => {
  const {chainId, offerId} = req.query

  const chainIdFormatted = chainId ? chainId.toString() : ""
  const offerIdFormatted = offerId ? offerId.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainIdFormatted)) {
    res.status(401).json({error: "ChainId does not belong to any valid chain"})
    return
  }

  try {
    const chain = validChains[chainIdFormatted as unknown as keyof typeof validChains]
    const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
    const sdk = new Sdk({chain: chain, transport: transports})

    const marketplace = new Marketplace(sdk)

    const offer = await marketplace.getOfferById({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      offerId: Number(offerIdFormatted)
    })

    const formattedOffer = OffersController.formatOffer(offer)

    const providerData = await marketplace.getProvider({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      provider: formattedOffer.provider
    })

    await OffersController.upsertOffer(formattedOffer, Number(chainIdFormatted), providerData.metadata, providerData.publicKey)

    res.status(200).json({message: "Offer Updated"})
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /upsertDeal
 * @description This endpoint is used to update or insert a deal in the database.
 */
app.get("/upsertDeal", validateParams({
  chainId: ValidatorType.NUMBER,
  dealId: ValidatorType.NUMBER
}), async (req, res) => {
  const {chainId, dealId} = req.query

  const chainIdFormatted = chainId ? chainId.toString() : ""
  const dealIdFormatted = dealId ? Number(dealId) : 0

  const chains = Object.keys(validChains)

  if(!chains.includes(chainIdFormatted)) {
    res.status(401).json({error: "ChainId does not belong to any valid chain"})
    return
  }

  try {
    const chain = validChains[chainIdFormatted as unknown as keyof typeof validChains]
    const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
    const sdk = new Sdk({chain: chain, transport: transports})

    const marketplace = new Marketplace(sdk)

    const deal = await marketplace.getDealById({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      dealId: Number(dealIdFormatted)
    })

    await DealsController.upsertDeal(DealsController.formatDeal(deal), Number(chainIdFormatted))

    res.status(200).json({message: "Deal updated"})
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /upsertResource
 * @description This endpoint is used to update or insert a resource in the database.
 */
app.get("/upsertResource", validateParams({
  address: ValidatorType.STRING,
  resourceId: ValidatorType.NUMBER,
  chainId: ValidatorType.NUMBER
}), async (req, res) => {
  const {address, resourceId, chainId} = req.query

  const addressFormatted = address ? address.toString() : ""
  const resourceIdFormatted = resourceId ? Number(resourceId) : 0
  const chainIdFormatted = chainId ? chainId.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainIdFormatted)) {
    res.status(401).json({error: "ChainId does not belong to any valid chain"})
    return
  }

  try {
    const chain = validChains[chainIdFormatted as unknown as keyof typeof validChains]
    const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
    const sdk = new Sdk({chain: chain, transport: transports})

    const resources = new Resources(sdk)

    const resource = await resources.getResource({
      id: resourceIdFormatted,
      address: addressFormatted
    })

    await ResourcesController.upsertResource(ResourcesController.formatResource(resource), Number(chainIdFormatted))

    res.status(200).json({message: "Resource Updated"})
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /upsertProvider
 * @description This endpoint is used to update or insert a provider in the database.
 */
app.get("/upsertProvider", validateParams({
  provider: ValidatorType.STRING,
  chainId: ValidatorType.NUMBER
}), async (req, res) => {
  const {provider, chainId} = req.query

  const providerFormatted = provider ? provider.toString() : ""
  const chainIdFormatted = chainId ? chainId.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainIdFormatted)) {
    res.status(401).json({error: "ChainId does not belong to any valid chain"})
    return
  }

  try {
    const chain = validChains[chainIdFormatted as unknown as keyof typeof validChains]
    const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
    const sdk = new Sdk({chain: chain, transport: transports})

    const marketplace = new Marketplace(sdk)

    const providerData = await marketplace.getProvider({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      provider: providerFormatted
    })

    await ProvidersController.upsertProvider(providerFormatted, Number(chainIdFormatted), undefined, providerData.metadata, providerData.publicKey)

    res.status(200).json({message: "Provider Updated"})
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /account/events
 * @description Retrieves event logs for a specific account and chain ID.
 * @param {string} account - The account identifier from the query parameters.
 * @param {number | undefined} chainId - The chain ID from the query parameters, parsed to a number if provided.
 * @returns {JSON} - The events associated with the given account and chainId or an error message in case of failure.
 */
app.get("/account/events", validateParams({
  account: ValidatorType.STRING,
  chainId: ValidatorType.NUMBER,
  page: ValidatorType.NUMBER_OPTIONAL,
  pageSize: ValidatorType.NUMBER_OPTIONAL
}), async (req, res) => {
  const account = req.query.account
  const chainId = req.query.chainId ? Number(req.query.chainId) : undefined
  const page = req.query.page ? Number(req.query.page) : undefined
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined
    
  /*if(!account || !chainId) {
    res.status(500).json({error: "No account provided or chainId provided"})
    return
  }*/
    
  try {
    const events = await EventsController.getAccountEvents(account!.toString(), chainId!, page, pageSize)
    res.json(events)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

app.post("/rateProvider", validateParams({
  provider: ValidatorType.STRING,
  chainId: ValidatorType.NUMBER
}), async (req, res) => {
  const {provider, chainId} = req.body

  const chainIdFormatted = chainId ? chainId.toString() : ""
  const chains = Object.keys(validChains)
  if(!chains.includes(chainIdFormatted)) {
    res.status(401).json({error: "ChainId does not belong to any valid chain"})
    return
  }

  try {
    const chain = validChains[chainIdFormatted as unknown as keyof typeof validChains]
    const transports = httpNetworks ? httpNetworks[chain.name].map(transport => http(transport)) : undefined
    const sdk = new Sdk({chain: chain, transport: transports})
    const rating = new RatingSystem(sdk)
    /*const providerRating = await rating.getAverageRating({
      marketplaceId: process.env.MARKETPLACE_ID!,
      provider: provider
    })*/

    const providerRating = await rating.getProviderRating({
      marketplaceId: process.env.MARKETPLACE_ID!,
      provider: provider
    })
    await RatingController.rateProvider(provider, chainId, Number(providerRating.sum), Number(providerRating.count))
    res.status(200).json({message: "Rating added"})
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.get("/provider/rating", validateParams({
  provider: ValidatorType.STRING,
  chainIds: ValidatorType.NUMBER_ARRAY_OPTIONAL
}), async (req, res) => {
  const {provider, chainIds} = req.query
  const chainId = chainIds && Array.isArray(JSON.parse(chainIds as string)) ? JSON.parse(chainIds as string).map((value: number) => parseInt(value.toString())) : undefined

  try {
    const rating = await RatingController.getAverageRating(provider!.toString(), chainId)
    res.status(200).json(rating)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Something went wrong"})
  }
})

// Create relations between tables
createRelationsBetweenTables()
  .then(() => {
    console.log("Tables created")
    app.listen(5000, () => {
      console.log("Server running on port 5000")
    })
  })