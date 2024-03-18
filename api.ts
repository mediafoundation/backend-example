import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { DealsController } from './database/controllers/dealsController';
import { ResourcesController } from './database/controllers/resourcesController';
import {OffersController} from "./database/controllers/offersController";
import {parseFilter} from "./utils/filter";
import {createRelationsBetweenTables} from "./database/utils";

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/deals', async (req, res) => {

    const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")

    const page = filters.page ? filters.page : 1

    const pageSize = filters.pageSize ? filters.pageSize : 10

    const dealFilter = parseFilter(filters.dealFilter ? filters.dealFilter : {})
    const metadataFilter = parseFilter(filters.metadataFilter ? filters.metadataFilter : {})
    const bandwidthFilter = parseFilter(filters.bandwidthFilter ? filters.bandwidthFilter : {})
    const nodeLocationFilter = parseFilter(filters.nodeLocationFilter ? filters.nodeLocationFilter : {})

    const deals = await DealsController.getDeals(dealFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize);
    res.json(deals);
});

app.get('/deals/:id', async (req, res) => {
    const deal = await DealsController.getDealById(req.params.id);
    res.json(deal);
})

app.get('/resources', async (req, res) => {
    const resources = await ResourcesController.getResources();
    res.json(resources);
});

app.get('/offers', async (req, res) => {
    const filters = JSON.parse(req.query.filters ? req.query.filters as string : "{}")
    
    const page = filters.page ? filters.page : 1
    
    const pageSize = filters.pageSize ? filters.pageSize : 10
    
    const offerFilter = parseFilter(filters.offerFilter ? filters.offerFilter : {})
    const metadataFilter = parseFilter(filters.metadataFilter ? filters.metadataFilter : {})
    const bandwidthFilter = parseFilter(filters.bandwidthFilter ? filters.bandwidthFilter : {})
    const nodeLocationFilter = parseFilter(filters.nodeLocationFilter ? filters.nodeLocationFilter : {})
    
    const offers = await OffersController.getOffers(offerFilter, metadataFilter, bandwidthFilter, nodeLocationFilter, page, pageSize);
    
    res.json(offers);
})

// Start the server
const port = 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

createRelationsBetweenTables()
.then(() => {
    console.log("Tables created")
})