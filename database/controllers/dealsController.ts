import {Deal} from "../models/Deal";
import {DealsMetadata} from "../models/DealsMetadata";
import {Resource} from "../models/Resource";
import {Provider} from "../models/Provider";
import {Client} from "../models/Client";
import {BandwidthLimit} from "../models/DealsBandwidthLimit";
import {DealsNodeLocations} from "../models/DealsNodeLocations";
import {DealsMetadataNodeLocations} from "../models/DealsMetadataNodeLocations";

export class DealsController {
    constructor() {
    }

    static async upsertDeal(deal: any) {

        console.log("Deal", deal)
        // Ensure the client exists
        const [client] = await Client.findOrCreate({
            where: {account: deal.client},
            defaults: {account: deal.client}
        });

        // Ensure the provider exists
        const [provider] = await Provider.findOrCreate({
            where: {account: deal.provider},
            defaults: {account: deal.provider}
        });

        // Find the resource or fail
        const resource = await Resource.findOne({
            where: {id: deal.resourceId}
        });

        if (!resource) {
            throw new Error('Resource not found');
        }

        // Ensure the metadata exists
        // Parse the metadata from the deal
        let rawMetadata = JSON.parse(deal.metadata);

        // Ensure the bandwidth limit exists
        const [bandwidthLimit] = await BandwidthLimit.upsert(rawMetadata.bandwidthLimit);

        console.log("BandwidthLimit", await BandwidthLimit.findAll())

        rawMetadata.bandwidthLimitId = bandwidthLimit.get('id');

        console.log("RawMetadata", rawMetadata)

        // Create or update the metadata
        const [metadata] = await DealsMetadata.upsert(rawMetadata);

        // Handle the node locations
        for (const location of rawMetadata.nodeLocations) {
            console.log("Location", location)
            const [nodeLocation] = await DealsNodeLocations.findOrCreate({
                where: { location },
                defaults: { location }
            });

            console.log("NodeLocation", nodeLocation.get('id'))
            console.log("Metadata", metadata.get('id'))

            console.log("MetadataAll", await DealsMetadata.findAll())
            console.log("NodeLocationAll", await DealsNodeLocations.findAll())

            const metadataId = await metadata.get('id');
            const nodeId = await nodeLocation.get('id');

            await DealsMetadataNodeLocations.findOrCreate({
                where: { metadataId, nodeId },
                defaults: { metadataId, nodeId }
            });
        }


        // Replace client, provider, resource and metadata names with their IDs
        console.log("ResourceId", resource.get('id'));
        deal.clientId = client.get('id');
        deal.providerId = provider.get('id');
        deal.resourceId = resource.get('id');
        deal.metadataId = metadata.get('id');

        const [instance, created] = await Deal.upsert(deal);
        return [instance, created];

    };

    static async getDeals() {
        try {
            return await Deal.findAll({attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
        } catch (error) {
            throw error;
        }
    }

    static async getDealById(id: string) {
        try {
            return await Deal.findByPk(id, {attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
        } catch (error) {
            throw error;
        }
    };

    static async deleteDealById(id: number) {
        try {
            const deal = await Deal.findByPk(id);
            if (!deal) {
                return null;
            }
            await deal.destroy();
            return deal;
        } catch (error) {
            throw error;
        }
    };

    static formatDeal(deal: any): any {
        // Check if the input is an object
        if (typeof deal !== 'object' || deal === null) {
            return deal;
        }

        // Create a new object to hold the result
        let result: any = {};

        // Iterate over the properties of the object
        for (const key in deal) {
            // If the property is an object, merge its properties with the result
            if (typeof deal[key] === 'object' && deal[key] !== null) {
                result = {...result, ...DealsController.formatDeal(deal[key])};
            } else if (typeof deal[key] === 'bigint') {
                // If the property is a bigint, parse it to a number
                result[key] = Number(deal[key]);
            } else {
                // Otherwise, just copy the property to the result
                result[key] = deal[key];
            }
        }
        return result;
    }
}