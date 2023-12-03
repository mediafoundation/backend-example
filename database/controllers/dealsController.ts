import {Deal} from "../models/Deal";

export class DealsController {
    constructor() {
    }

    static async upsertDeal(deal: any) {
        try {
            const [instance, created] = await Deal.upsert(deal);
            return [instance, created];
        } catch (error) {
            throw error;
        }
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