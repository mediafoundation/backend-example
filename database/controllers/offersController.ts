import {Offer} from "../models/offers/Offer"
import {WhereOptions} from "sequelize"
import {Provider} from "../models/Provider"
import {OfferFormatted, OfferMetadataSchema, OfferRawSchema, OfferTransformed} from "../models/types/offer"
import {NodeLocation} from "../models/NodeLocation"
import {BandwidthLimit} from "../models/BandwidthLimit"
import {OfferMetadata} from "../models/offers/OffersMetadata"
export class OffersController{

  static async upsertOffer(offer: any) {

    const provider = await Provider.findOrCreate({
      where: {account: offer.provider},
      defaults: {account: offer.provider}
    })

    const [instance, created] = await Offer.upsert(offer)

    await instance.setProvider(provider[0])

    await instance.createMetadata({offerId: instance.dataValues.id, ...offer.metadata})

    await instance.createBandwidthLimit({offerId: instance.dataValues.id, ...offer.metadata.bandwidthLimit})

    for (const nodeLocation of offer.metadata.nodeLocations) {
      try {
        await instance.createNodeLocation({location: nodeLocation}, {ignoreDuplicates: true})
      } catch (e) {
        console.log(e)
      }
    }

    return {
      offer: instance.dataValues,
      created: created
    }

  }

  static async getOffers(
    offerFilter: WhereOptions<any> = {},
    metadataFilter: WhereOptions<any> = {},
    bandwidthLimitFilter: WhereOptions<any> = {},
    nodeLocationFilter: WhereOptions<any> = {},
    page = 1,
    pageSize = 10): Promise<Array<any>> {
    
    const offset = (page - 1) * pageSize

    const offers = await Offer.findAll({
      include: [
        {
          model: NodeLocation,
          attributes: ["location"],
          through: {
            attributes: []
          },
          required: false,
          where: nodeLocationFilter
        },

        {
          model: OfferMetadata,
          as: "Metadata",
          where: metadataFilter
        },

        {
          model: BandwidthLimit,
          as: "BandwidthLimit",
          where: bandwidthLimitFilter
        }
      ],
      where: offerFilter,
      offset: offset,
      limit: pageSize
    })
      
    console.log(offers.length, offset, pageSize)

    const mappedOffers = offers.map((offer: Offer) => {
      return offer.toJSON()
    })

    return mappedOffers.map((offer) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      offer.NodeLocations = offer.NodeLocations.map((location: any) => location.location)
      return offer
    })
  }

  static async getOfferById(id: string) {
    
    const offer = await Offer.findByPk(id, {attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]}})

    if(!offer){
      return null
    }

    const metadata = await offer.getMetadata()

    const bandwidthLimit = await offer.getBandwidthLimit()

    const nodeLocations = await offer.getNodeLocations()

    return ({
      offer: offer.dataValues,
      metadata: metadata.dataValues,
      bandwidthLimit: bandwidthLimit.dataValues,
      nodeLocations: nodeLocations.map((nodeLocation: NodeLocation) => nodeLocation.dataValues.location)
    })
  }

  static async deleteOfferById(id: string) {
    
    const offer = await Offer.findByPk(id)
    if (!offer) {
      return null
    }
    await offer.destroy()
    return offer
  
  }

  static formatOffer(offer: any): OfferFormatted {
    OfferRawSchema.parse(offer)

    const transformed = this.transformObj(offer)

    transformed["metadata"] = JSON.parse(transformed.metadata)

    OfferMetadataSchema.parse(transformed.metadata)

    return transformed as unknown as OfferFormatted
  }

  private static transformObj(offer: any): OfferTransformed {
    let result: any = {}

    // Iterate over the properties of the object
    for (const key in offer) {
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