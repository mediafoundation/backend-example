import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { DealsController } from "./database/controllers/dealsController"
import { ResourcesController } from "./database/controllers/resourcesController"
import {OffersController} from "./database/controllers/offersController"
import {parseFilter} from "./utils/filter"
import {createRelationsBetweenTables} from "./database/utils"

// Initialize express app
export const app = express()

// Middleware
app.use(bodyParser.json()) // for parsing application/json
/**
 * GET /resources
 * Retrieves all resources.
 */
app.get("/resources", async (req, res) => {
  try{
    const resources = await ResourcesController.getResources()
    res.json(resources)
  } catch (e) {
    console.log("Error:", e)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.use(cors()) // for enabling CORS

// Routes

/**
 * GET /deals
 * Retrieves deals based on provided filters, page number and page size.
 */
app.get("/deals", async (req, res) => {
  const chainId = req.query.chainId
  
  if(!chainId) {
    return res.status(400).json({error: "Chain id is required"})
  }

  // Parse filters from query parameters
  const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")

  // Get page number and size from filters
  const page = filters.page ? filters.page : 1

  const pageSize = filters.pageSize ? filters.pageSize : 10

  // Parse individual filters
  const dealFilter = parseFilter(filters.dealFilter ? filters.dealFilter : {})
  const metadataFilter = parseFilter(filters.metadataFilter ? filters.metadataFilter : {})
  const bandwidthFilter = parseFilter(filters.bandwidthFilter ? filters.bandwidthFilter : {})
  const nodeLocationFilter = parseFilter(filters.nodeLocationFilter ? filters.nodeLocationFilter : {})
  
  try{
    // Get deals from DealsController
    const deals = await DealsController.getDeals(Number(chainId), dealFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize)
    
    // Send response
    res.json(deals)
  } catch (e) {
    console.log("Something went wrong")
    console.log({error: e})
    
    res.status(500).json({error: "Something went wrong"})
  }
})

/**
 * GET /deals/:id
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
  const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")
    
  const page = filters.page ? filters.page : 1
    
  const pageSize = filters.pageSize ? filters.pageSize : 10
    
  const offerFilter = parseFilter(filters.offerFilter ? filters.offerFilter : {})
  const metadataFilter = parseFilter(filters.metadataFilter ? filters.metadataFilter : {})
  const bandwidthFilter = parseFilter(filters.bandwidthFilter ? filters.bandwidthFilter : {})
  const nodeLocationFilter = parseFilter(filters.nodeLocationFilter ? filters.nodeLocationFilter : {})
    
  const offers = await OffersController.getOffers(Number(filters.marketplaceId), offerFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize)
  
  res.json(offers)
})

// Start the server
const port = 5000
export const server = app.listen(port, () => console.log(`Server is running on port ${port}`))

// Create relations between tables
createRelationsBetweenTables()
  .then(() => {
    console.log("Tables created")
  })