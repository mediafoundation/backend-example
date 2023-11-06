import {Deal} from "../models/Deal";

const upsertDeal = async (deal: any) => {
  try {
    const [instance, created] = await Deal.upsert(deal);
    return [instance, created];
  } catch (error) {
    throw error;
  }
};

const getDealById = async (id: number) => {
  try {
    return await Deal.findByPk(id);
  } catch (error) {
    throw error;
  }
};

const deleteDealById = async (id: number) => {
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

module.exports = {
  upsertDeal,
  getDealById,
  deleteDealById
};