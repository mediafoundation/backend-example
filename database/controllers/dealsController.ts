import {Deal} from "../models/Deal";

export class DealsController {
  constructor() {}
  static async upsertDeal (deal: any)  {
    try {
      const [instance, created] = await Deal.upsert(deal);
      return [instance, created];
    } catch (error) {
      throw error;
    }
  };

  static async getDealById (id: number) {
    try {
      return await Deal.findByPk(id);
    } catch (error) {
      throw error;
    }
  };

  static async deleteDealById (id: number) {
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
}