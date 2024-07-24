/**
 * @file api.ts
 * @description This file contains the main API endpoints for the application.
 */

import {Marketplace, Resources, Sdk, validChains} from "media-sdk"
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
import {Document, WithId} from "mongodb"
import {ProvidersMetadata} from "./database/models/Providers/ProvidersMetadata"

// Initialize express app
export const app = express()

// Middleware
app.use(bodyParser.json()) // for parsing application/json
app.use(cors()) // for enabling CORS

/**
 * @function manageIncomingFilterRequest
 * @description Manage incoming request and parse filters from query parameters
 * @param {object} req - The request object
 * @returns {object} - The parsed filters
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
app.get("/resources", async (req, res) => {
  const chainId = req.query.chainId

  if(chainId) {
    try{
      const resources = await ResourcesController.getResources(Number(chainId))
      res.json(resources)
    } catch (e) {
      console.log("Error:", e)
      res.status(500).json({error: "Something went wrong"})
    }
  }

  // Loop for all validChains
  else {
    const resources = []
    const validChainKeys = Object.keys(validChains)
    try {
      for (const chain of validChainKeys) {
        const resourcesFromDb = await ResourcesController.getResources(Number(chain))
        resources.push(...resourcesFromDb)
      }

      res.json(resources)
    } catch (e) {
      console.log("Error:", e)
      res.status(500).json({error: "Something went wrong"})
    }
  }
})

/**
 * @route GET /deals
 * @description Retrieves deals based on provided filters, page number and page size.
 */
app.get("/deals", async (req, res) => {
  const chainId = req.query.chainId ? Number(req.query.chainId) : undefined

  const managedFilters = manageIncomingFilterRequest(req)

  try{
    // Get deals from DealsController
    const deals = await DealsController.getDeals(chainId, managedFilters.genericFilter, managedFilters.metadataFilter, managedFilters.bandwidthFilter, managedFilters.nodeLocationFilter, managedFilters.page, managedFilters.pageSize)

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
app.get("/deals/:id/chainId/:chainId", async (req, res) => {
  const deal = await DealsController.getDealByIdAndChain(Number(req.params.id), Number(req.params.chainId))
  res.json(deal)
})

/**
 * @route GET /offers
 * @description Retrieves offers based on provided filters, page number and page size.
 */
app.get("/offers", async (req, res) => {
  const chainId = req.query.chainId ? Number(req.query.chainId) : undefined

  const managedFilters = manageIncomingFilterRequest(req)
  try {
    const offers = await OffersController.getOffers(chainId, managedFilters.genericFilter, managedFilters.metadataFilter, managedFilters.bandwidthFilter, managedFilters.nodeLocationFilter, managedFilters.page, managedFilters.pageSize)
    res.json(offers)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Some went wrong"})
  }
})

/**
 * @route GET /providers
 * @description Retrieves providers based on provided filters, page number and page size.
 */
app.get("/providers", async(req, res) => {
  try {

    const result = []

    const page = req.query.page ? Number(req.query.page) : undefined
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined
    const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined
    const account = req.query.account

    const providers = await ProvidersController.getProviders(chainId, page, pageSize, account as string | undefined)

    for (const provider of providers) {
      const dealsCount = await ProvidersController.countDeals(provider.account, chainId)
      const offersCount = await ProvidersController.countOffers(provider.account, chainId)
      const clientCount = await ProvidersController.countClients(provider.account, chainId)
      let providerMetadata: { [index: number]: any } | ProvidersMetadata | null = {}
      let registryTime: { [index: number]: any } | number = {}

      if(chainId) {
        providerMetadata = await ProvidersController.getMetadata(provider.account, chainId)
        registryTime = await ProvidersController.getProviderStartTime(provider.account, chainId)
      }

      else {
        const chains = provider.Chains
        for (const chain of chains!) {
          providerMetadata[chain] = await ProvidersController.getMetadata(provider.account, [Number(chain)])
          registryTime[chain] = (await ProvidersController.getProviderStartTime(provider.account, [Number(chain)]))[chain]
        }
      }

      const providerResult = {
        "address": provider.account,
        "chains": provider.Chains,
        "deals": dealsCount,
        "offers": offersCount,
        "clients": clientCount,
        "metadata": providerMetadata,
        "registerTime": registryTime
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
app.get("/providers/countNewDeals", async (req, res) => {
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
app.get("/providers/totalRevenue", async (req, res) => {
  try {
    const provider = req.query.provider
    const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined

    if(!provider || !chainId || !Array.isArray(JSON.parse(req.query.chainId as string))) {
      res.status(500).json({error: "No provider or valid chainId provided"})
      return
    }
    else {
      const response: {[index: number]: any} = {}
      for (const chain of chainId) {
        const queryResult = await EventsController.calculateProviderRevenue(provider.toString(), Number(chain))
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
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /providers/countNewClients
 * @description Retrieves the count of new clients for a provider.
 */
app.get("/providers/countNewClients", async (req, res) => {
  const provider = req.query.provider
  const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined
  const fromTimestamp = req.query.from ? Number(req.query.from) : undefined
  const toTimestamp = req.query.to ? Number(req.query.to) : undefined

  if(!provider || !chainId || !Array.isArray(JSON.parse(req.query.chainId as string))) {
    res.status(500).json({error: "No provider or chainId provided"})
    return
  }

  try {
    const result = await ProvidersController.getProviderNewClients(provider as string, chainId, fromTimestamp, toTimestamp)
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
app.get("/providers/countActiveClients", async (req, res) => {
  const provider = req.query.provider
  const chainId = req.query.chainId && Array.isArray(JSON.parse(req.query.chainId as string)) ? JSON.parse(req.query.chainId as string).map((value: number) => parseInt(value.toString())) : undefined
  const fromTimestamp = req.query.from ? Number(req.query.from) : undefined
  const toTimestamp = req.query.to ? Number(req.query.to) : undefined

  if(!provider) {
    res.status(500).json({error: "No provider provided"})
    return
  }

  try {
    const result = await ProvidersController.getProviderActiveClients(provider as string, chainId, fromTimestamp, toTimestamp)
    res.json(result)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

/**
 * @route GET /upsertOffer
 * @description This endpoint is used to update or insert an offer in the database.
 */
app.get("/upsertOffer", async (req, res) => {
  const {chainIdQuery, offerIdQuery} = req.query

  const chainId = chainIdQuery ? chainIdQuery.toString() : ""
  const offerId = offerIdQuery ? offerIdQuery.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainId)) {
    res.status(500).json({error: "Invalid chain"})
    return
  }

  try {
    const sdk = new Sdk({chain: validChains[chainId as unknown as keyof typeof validChains]})

    const marketplace = new Marketplace(sdk)

    const offer = await marketplace.getOfferById({
      marketplaceId: process.env.MARKETPLACE_ID,
      offerId: offerId
    })

    const formattedOffer = OffersController.formatOffer(offer)

    const providerData = await marketplace.getProvider({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      provider: formattedOffer.provider
    })

    await OffersController.upsertOffer(formattedOffer, Number(chainId), providerData.metadata, providerData.publicKey)

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
app.get("/upsertDeal", async (req, res) => {
  const {chainIdQuery, dealIdQuery} = req.query

  const chainId = chainIdQuery ? chainIdQuery.toString() : ""
  const dealId = dealIdQuery ? Number(dealIdQuery) : 0

  const chains = Object.keys(validChains)

  if(!chains.includes(chainId)) {
    res.status(500).json({error: "Invalid chain"})
    return
  }

  try {
    const sdk = new Sdk({chain: validChains[chainId as unknown as keyof typeof validChains]})

    const marketplace = new Marketplace(sdk)

    const deal = await marketplace.getDealById({
      marketplaceId: process.env.MARKETPLACE_ID,
      dealId: dealId
    })

    await DealsController.upsertDeal(DealsController.formatDeal(deal), Number(chainId))

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
app.get("/upsertResource", async (req, res) => {
  const {addressQuery, resourceIdQuery, chainIdQuery} = req.query

  const address = addressQuery ? addressQuery.toString() : ""
  const resourceId = resourceIdQuery ? Number(resourceIdQuery) : 0
  const chainId = chainIdQuery ? chainIdQuery.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainId)) {
    res.status(500).json({error: "Invalid chain"})
    return
  }

  try {
    const sdk = new Sdk({chain: validChains[chainId as unknown as keyof typeof validChains]})

    const resources = new Resources(sdk)

    const resource = await resources.getResource({
      id: resourceId,
      address: address
    })

    await ResourcesController.upsertResource(ResourcesController.formatResource(resource), Number(chainId))

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
app.get("/upsertProvider", async (req, res) => {
  const {providerQuery, chainIdQuery} = req.query

  const provider = providerQuery ? providerQuery.toString() : ""
  const chainId = chainIdQuery ? chainIdQuery.toString() : ""

  const chains = Object.keys(validChains)

  if(!chains.includes(chainId)) {
    res.status(500).json({error: "Invalid chain"})
    return
  }

  try {
    const sdk = new Sdk({chain: validChains[chainId as unknown as keyof typeof validChains]})

    const marketplace = new Marketplace(sdk)

    const providerData = await marketplace.getProvider({
      marketplaceId: Number(process.env.MARKETPLACE_ID),
      provider: provider
    })

    await ProvidersController.upsertProvider(provider, Number(chainId), undefined, providerData.metadata, providerData.publicKey)

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
app.get("/account/events", async (req, res) => {
  const account = req.query.account
  const chainId = req.query.chainId ? Number(req.query.chainId) : undefined
  const page = req.query.page ? Number(req.query.page) : undefined
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined
    
  if(!account || !chainId) {
    res.status(500).json({error: "No account provided or chainId provided"})
    return
  }
    
  try {
    const events = await EventsController.getAccountEvents(account.toString(), chainId, page, pageSize)
    res.json(events)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: e})
  }
})

// Start the server
const port = 5000
export const server = app.listen(port, () => console.log(`Server is running on port ${port}`))

// Create relations between tables
createRelationsBetweenTables()
  .then(() => {
    console.log("Tables created")
  })