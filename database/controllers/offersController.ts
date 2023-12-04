import {Offer} from "../models/offers/Offer";
import {offerSchema} from "../models/offers/OfferSchema";
import {Model} from "sequelize";
const z = require('zod')

const upsertOffer = async (offer: any): Promise<[Model<any>, boolean | null]> => {
  try {
    //todo check if metadata should be parse here
    //offer.metadata = JSON.parse(offer.metadata);
    const [instance, created] = await Offer.upsert(z.array(offerSchema).parse(offer));
    return [instance, created];
  } catch (error) {
    throw error;
  }
};

const getOfferById = async (id: number): Promise<Model<any, any> | null> => {
  try {
    return await Offer.findByPk(id);
  } catch (error) {
    throw error;
  }
};

const deleteOfferById = async (id: number) => {
  try {
    const offer = await Offer.findByPk(id);
    if (!offer) {
      return null;
    }
    await offer.destroy();
    return offer;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  upsertOffer,
  getOfferById,
  deleteOfferById
};