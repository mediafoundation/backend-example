import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { DealsController } from './database/controllers/dealsController';
import { ResourcesController } from './database/controllers/resourcesController';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/deals', async (req, res) => {
    const deals = await DealsController.getDeals();
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

// Start the server
const port = 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));