import {Offer} from "../models/offers/Offer";
import {OffersMetadata} from "../models/offers/OffersMetadata";
import {OffersNodeLocations} from "../models/offers/OffersNodeLocations";
import {OffersMetadataNodeLocations} from "../models/offers/OffersMetadataNodeLocations";
import {OffersBandwidthLimit} from "../models/offers/OffersBandwidthLimit";
export class OffersController{

  static async upsertOffer(offer: any) {

    // Ensure the metadata exists
    // Parse the metadata from the deal
    let rawMetadata = JSON.parse(offer.metadata);

    // Ensure the bandwidth limit exists
    const [bandwidthLimit] = await OffersBandwidthLimit.upsert(rawMetadata.bandwidthLimit);

    rawMetadata.bandwidthLimitId = bandwidthLimit.get('id');

    // Create or update the metadata
    const [metadata] = await OffersMetadata.upsert(rawMetadata);

    // Handle the node locations
    for (const location of rawMetadata.nodeLocations) {
      const [nodeLocation] = await OffersNodeLocations.findOrCreate({
        where: { location },
        defaults: { location }
      });

      const metadataId = await metadata.get('id');
      const nodeId = await nodeLocation.get('id');

      await OffersMetadataNodeLocations.findOrCreate({
        where: { metadataId, nodeId },
        defaults: { metadataId, nodeId }
      });
    }
    offer.metadataId = metadata.get('id');

    const [instance, created] = await Offer.upsert(offer);
    return [instance, created];

  };

  static async getOffers() {
    try {
      return await Offer.findAll({attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
    } catch (error) {
      throw error;
    }
  }

  static async getOfferById(id: string) {
    try {
      return await Offer.findByPk(id, {attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
    } catch (error) {
      throw error;
    }
  };

  static async deleteOfferById(id: number) {
    try {
      const deal = await Offer.findByPk(id);
      if (!deal) {
        return null;
      }
      await deal.destroy();
      return deal;
    } catch (error) {
      throw error;
    }
  };

  static formatOffer(deal: any): any {
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
        result = {...result, ...OffersController.formatOffer(deal[key])};
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