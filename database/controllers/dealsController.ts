import {Deal} from "../models/deals/Deal";
import {DealsMetadata, DealsMetadataType} from "../models/deals/DealsMetadata";
import {Resource} from "../models/Resource";
import {Provider} from "../models/Provider";
import {Client} from "../models/Client";
import {DealsBandwidthLimit} from "../models/deals/DealsBandwidthLimit";
import {DealsNodeLocations} from "../models/deals/DealsNodeLocations";
import {DealsLocations} from "../models/deals/DealsLocations";
import {DealsResources} from "../models/associations/DealsResources";

export class DealsController {
    constructor() {
    }


    static async upsertDeal(deal: any) {
        const resource = await Resource.findOne({
            where: {id: deal.resourceId}
        });

        if (!resource) {
            throw new Error('Resource not found for deal: ' + deal.id + ' with resource id: ' + deal.resourceId);
        }

        const [client] = await Client.findOrCreate({
            where: {account: deal.client},
            defaults: {account: deal.client}
        });
        // Ensure the provider exists

        const [provider] = await Provider.findOrCreate({
            where: {account: deal.provider},
            defaults: {account: deal.provider}
        });

        deal.clientId = client.get('id');
        deal.providerId = provider.get('id');
        deal.resourceId = resource.get('id');

        const [instance, created] = await Deal.upsert(deal);

        let rawMetadata = JSON.parse(deal.metadata);
        let rawBandwidthLimit = rawMetadata.bandwidthLimit;

        rawMetadata.dealId = instance.get('id');
        rawBandwidthLimit.dealId = instance.get('id');

        // Ensure the bandwidth limit exists
        await DealsBandwidthLimit.upsert(rawBandwidthLimit);



        // Create or update the metadata
        await DealsMetadata.upsert(rawMetadata);

        for (const location of rawMetadata.nodeLocations) {
            const [nodeLocation] = await DealsNodeLocations.findOrCreate({
                where: { location },
                defaults: { location }
            });

            const dealId = instance.get('id');
            const nodeId = nodeLocation.get('id');

            await DealsLocations.findOrCreate({
                where: { dealId, nodeId },
                defaults: { dealId, nodeId }
            });
        }

        await DealsResources.findOrCreate({
            where: { dealId: deal.id, resourceId: deal.resourceId },
            defaults: { dealId: deal.id, resourceId: deal.resourceId }

        })
        return [instance, created];

    };

    static async getDeals(): Promise<Array<any>> {
        try {
            return await Deal.findAll({
                attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                include: [
                    {
                        model: DealsMetadata,
                        as: "Metadata",
                        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                    },
                    {
                        model: DealsBandwidthLimit,
                        as: "BandwidthLimit",
                        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                    }
                ],
                raw: true,
                nest: true,
            });
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

    static parseDealMetadata(metadata: string){
        DealsMetadataType.parse(JSON.parse(metadata));
    }
}