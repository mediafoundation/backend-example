import {Deal} from "../models/deals/Deal";
import {Resource} from "../models/Resource";
import {Client} from "../models/Client";
/**
 * import {DealsLocations} from "../models/deals/DealsLocations";
 * import {DealsResources} from "../models/associations/DealsResources";
 */
import {WhereOptions} from "sequelize";
import {DealFormatted, DealRawSchema, DealTransformed, MetadataSchema} from "../models/types/deal";
import {DealMetadata} from "../models/deals/DealsMetadata";

export class DealsController {
    constructor() {
    }


    static async upsertDeal(deal: DealFormatted) {
        const resource = await Resource.findOne({
            where: {id: deal.resourceId}
        });

        if (!resource) {
            throw new Error('Resource not found for deal: ' + deal.id + ' with resource id: ' + deal.resourceId);
        }

        await Client.findOrCreate({
            where: {account: deal.client},
            defaults: {account: deal.client}
        });

        const [instance, created] = await Deal.upsert(deal, {returning: true});


        await instance.createMetadata({dealId: instance.dataValues.id, ...deal.metadata});


        return {
            deal: instance.dataValues,
            created: created
        };
    };

    static async getDeals(filter: WhereOptions<any> = {}, page = 1, pageSize = 10): Promise<Array<any>> {
        try {
            const offset = (page - 1) * pageSize;
            return await Deal.findAll({
                attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                where: filter,
                include: [
                    {
                        model: DealMetadata,
                        as: "Metadata",
                        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                    },
                    /*{
                        model: BandwidthLimit,
                        as: "BandwidthLimit",
                        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
                    }*/
                ],
                raw: true,
                nest: true,
                offset: offset,
                limit: pageSize,
            });
        } catch (error) {
            throw error;
        }
    }

    static async upsertMetadata(deal: any) {
        let metadata = JSON.parse(deal.metadata);
        const [instance, created] = await DealMetadata.findOrCreate({
            where: {dealId: deal.id},
            defaults: {
                dealId: deal.id,
                type: metadata.type,
                label: metadata.label,
                autoSsl: metadata.autoSsl,
                burstSpeed: metadata.burstSpeed,
                apiEndpoint: metadata.apiEndpoint,
                customCnames: metadata.customCnames
            }
        });

        console.log("Metadata", metadata, instance, created)

        if(!created){
            await instance.update({
                type: metadata.type,
                label: metadata.label,
                autoSsl: metadata.autoSsl,
                burstSpeed: metadata.burstSpeed,
                apiEndpoint: metadata.apiEndpoint,
                customCnames: metadata.customCnames
            });
        }

        return [instance.dataValues, created];
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

    static formatDeal(deal: any): DealFormatted {

        DealRawSchema.parse(deal)

        let transformed = this.transformObj(deal)

        transformed['metadata'] = JSON.parse(transformed.metadata)

        MetadataSchema.parse(transformed.metadata)

        return transformed as unknown as DealFormatted;
    }
    static transformObj(deal: any): DealTransformed {
        let result: any = {};

        // Iterate over the properties of the object
        for (const key in deal) {
            // If the property is an object, merge its properties with the result
            if (typeof deal[key] === 'object' && deal[key] !== null) {
                result = {...result, ...DealsController.transformObj(deal[key])};
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