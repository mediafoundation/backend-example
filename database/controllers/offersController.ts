import {Offer} from "../models/offers/Offer"
import {WhereOptions} from "sequelize"
import {Provider} from "../models/Provider"
import {OfferFormatted, OfferMetadataSchema, OfferRawSchema, OfferTransformed} from "../models/types/offer"
import {NodeLocation} from "../models/NodeLocation"
import {BandwidthLimit} from "../models/BandwidthLimit"
import {OfferMetadata} from "../models/offers/OffersMetadata"
import {Chain} from "../models/Chain"

/**
 * OffersController class
 */
export class OffersController{
  
  /**
   * Upsert an offer
   * @param offer - The offer to be upserted
   * @param chainId - The id of the chain where the offer is
   * @returns Promise<{offer: InferAttributes<Offer, {omit: never}>, created: boolean | null}>
   */
  static async upsertOffer(offer: OfferFormatted, chainId: number) {
    // Find or create a provider
    const provider = await Provider.findOrCreate({
      where: {account: offer.provider},
      defaults: {account: offer.provider}
    })
    
    // Upsert the offer
    const [instance, created] = await Offer.upsert({chainId: chainId, ...offer})
    
    // Set the provider for the offer
    await instance.setProvider(provider[0])
    
    // Create metadata for the offer
    const metadata = await instance.createMetadata({offerId: instance.dataValues.id, ...offer.metadata})
    
    // Create bandwidth limit for the offer
    await metadata.createBandwidthLimit({offerMetadataId: instance.dataValues.id, ...offer.metadata.bandwidthLimit})
    
    // Create node locations for the offer
    for (const nodeLocation of offer.metadata.nodeLocations) {
      await instance.createNodeLocation({location: nodeLocation})
    }
    
    return {
      offer: instance.dataValues,
      created: created
    }
  }
  
  /**
   * Get offers
   * @param offerFilter - Filter for the offers
   * @param metadataFilter - Filter for the metadata
   * @param bandwidthLimitFilter - Filter for the bandwidth limit
   * @param nodeLocationFilter - Filter for the node locations
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Promise<Array<any>>
   */
  static async getOffers(
    chainId: number = 1,
    offerFilter: WhereOptions<any> = {},
    metadataFilter: WhereOptions<any> = {},
    bandwidthLimitFilter: WhereOptions<any> = {},
    nodeLocationFilter: WhereOptions<any> = {},
    page = 1,
    pageSize = 10): Promise<Array<any>> {
    
    // Calculate the offset
    const offset = (page - 1) * pageSize
    
    // Find all offers with the given filters
    const offers = await Offer.findAll({
      include: [
        {
          model: Chain,
          as: "Chain",
          where: {
            chainId: chainId
          }
        },
        {
          model: NodeLocation,
          attributes: ["location"],
          through: {
            attributes: []
          },
          where: nodeLocationFilter
        },
        
        {
          model: OfferMetadata,
          as: "Metadata",
          where: metadataFilter,
          include: [
            {
              model: BandwidthLimit,
              as: "BandwidthLimit",
              where: bandwidthLimitFilter
            }
          ]
        },
      ],
      where: offerFilter,
      offset: offset,
      limit: pageSize
    })
    
    // Map the offers to JSON
    const mappedOffers = offers.map((offer: any) => {
      return offer.toJSON()
    })
    
    // Get the node locations for each offer
    for (let i = 0; i < offers.length; i++) {
      mappedOffers[i].NodeLocations = await offers[i].getNodeLocations({attributes: ["location"]})
      mappedOffers[i].NodeLocations = mappedOffers[i].NodeLocations.map((location: any) => location.location)
    }
    
    return mappedOffers
  }
  
  /**
   * Get offer by id
   * @param id - The id of the offer
   * @returns Promise<{offer: InferAttributes<Offer, {omit: never}>,metadata: InferAttributes<OfferMetadata, {omit: never}>,bandwidthLimit: InferAttributes<BandwidthLimit, {omit: never}>,nodeLocations: Array<string>}>
   */
  static async getOfferByIdAndChain(id: number, chainId: number) {
    
    // Find the offer by id
    const offer = await Offer.findOne({
      where: {
        offerId: id,
        chainId: chainId
      }
    })
    
    if(!offer){
      return null
    }
    
    // Get the metadata for the offer
    const metadata = await offer.getMetadata()
    
    // Get the bandwidth limit for the offer
    const bandwidthLimit = await metadata.getBandwidthLimit()
    
    // Get the node locations for the offer
    const nodeLocations = await offer.getNodeLocations()
    
    return ({
      offer: offer.dataValues,
      metadata: metadata.dataValues,
      bandwidthLimit: bandwidthLimit.dataValues,
      nodeLocations: nodeLocations.map((nodeLocation: NodeLocation) => nodeLocation.dataValues.location)
    })
  }
  
  /**
   * Delete offer by id
   * @param id - The id of the offer
   * @returns Promise<Offer | null>
   */
  static async deleteOfferById(id: number, chainId: number) {
    
    // Find the offer by id
    const offer = await Offer.findOne({
      where: {
        chainId: chainId,
        offerId: id
      }
    })
    if (!offer) {
      return null
    }
    // Delete the offer
    await offer.destroy()
    return offer
  }
  
  /**
   * Format offer
   * @param offer - The offer to be formatted
   * @returns OfferFormatted
   */
  static formatOffer(offer: any): OfferFormatted {
    // Parse the raw schema of the offer
    OfferRawSchema.parse(offer)
    
    // Transform the offer
    const transformed = this.transformObj(offer)
    
    // Parse the metadata of the offer
    transformed["metadata"] = JSON.parse(transformed.metadata)
    
    // Parse the metadata schema of the offer
    OfferMetadataSchema.parse(transformed.metadata)
    
    return transformed as unknown as OfferFormatted
  }
  
  /**
   * Transform object
   * @param offer - The offer to be transformed
   * @returns OfferTransformed
   */
  private static transformObj(offer: any): OfferTransformed {
    let result: any = {}
    
    // Iterate over the properties of the object
    for (const key in offer) {
      // If the key is "id", transform it to "offerId"
      if(key === "id") {
        result["offerId"] = Number(offer["id"])
        delete offer["id"]
      }
      // If the property is an object, merge its properties with the result
      if (typeof offer[key] === "object" && offer[key] !== null) {
        result = {...result, ...this.transformObj(offer[key])}
      } else if (typeof offer[key] === "bigint") {
        // If the property is a bigint, parse it to a number
        result[key] = Number(offer[key])
      } else {
        // Otherwise, just copy the property to the result
        result[key] = offer[key]
      }
    }
    
    return result
  }
}