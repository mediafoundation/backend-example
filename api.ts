import {validChains} from "media-sdk"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { DealsController } from "./database/controllers/dealsController"
import { ResourcesController } from "./database/controllers/resourcesController"
import {OffersController} from "./database/controllers/offersController"
import {parseFilter} from "./utils/filter"
import {createRelationsBetweenTables} from "./database/utils"
import {ProvidersController} from "./database/controllers/providersController"

// Initialize express app
export const app = express()

// Middleware
app.use(bodyParser.json()) // for parsing application/json
app.use(cors()) // for enabling CORS

/**
 * Manage incoming request
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
 * GET /resources
 * Retrieves all resources.
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
 * GET /deals
 * Retrieves deals based on provided filters, page number and page size.
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
 * GET /deals/:id/chainId/:chainId
 * Retrieves a deal by its id.
 */
app.get("/deals/:id/chainId/:chainId", async (req, res) => {
  const deal = await DealsController.getDealByIdAndChain(Number(req.params.id), Number(req.params.chainId))
  res.json(deal)
})

/**
 * GET /offers
 * Retrieves offers based on provided filters, page number and page size.
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

app.get("/providers", async(req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined
    const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")
    const chainFilter = filters.chainFilter ? parseFilter(filters.chainFilter) : undefined

    const providers = await ProvidersController.getProviders(chainFilter, page, pageSize)
    res.json(providers)
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Something went wrong"})
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