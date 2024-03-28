import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { DealsController } from "./database/controllers/dealsController"
import { ResourcesController } from "./database/controllers/resourcesController"
import {OffersController} from "./database/controllers/offersController"
import {parseFilter} from "./utils/filter"
import {createRelationsBetweenTables} from "./database/utils"

// Initialize express app
const app = express()

// Middleware
app.use(bodyParser.json()) // for parsing application/json
app.use(cors()) // for enabling CORS

// Routes

/**
 * GET /deals
 * Retrieves deals based on provided filters, page number and page size.
 */
app.get("/deals", async (req, res) => {

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

  // Get deals from DealsController
  const deals = await DealsController.getDeals(dealFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize)
  
  // Send response
  res.json(deals)
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
 * GET /resources
 * Retrieves all resources.
 */
app.get("/resources", async (req, res) => {
  const resources = await ResourcesController.getResources()
  res.json(resources)
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
    
  const offers = await OffersController.getOffers(offerFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize)
  
  res.json(offers)
})

// Start the server
const port = 5000
app.listen(port, () => console.log(`Server is running on port ${port}`))

// Create relations between tables
createRelationsBetweenTables()
  .then(() => {
    console.log("Tables created")
  })