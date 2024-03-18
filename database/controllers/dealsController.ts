import {Deal} from "../models/deals/Deal"
import {Resource} from "../models/Resource"
import {Client} from "../models/Client"
/**
 * import {DealsLocations} from "../models/deals/DealsLocations";
 * import {DealsResources} from "../models/associations/DealsResources";
 */
import {WhereOptions} from "sequelize"
import {DealFormatted, DealRawSchema, DealTransformed, MetadataSchema} from "../models/types/deal"
import {DealMetadata} from "../models/deals/DealsMetadata"
import {NodeLocation} from "../models/NodeLocation"
import {BandwidthLimit} from "../models/BandwidthLimit"
import {Provider} from "../models/Provider"

export class DealsController {
  static async upsertDeal(deal: DealFormatted, network: string) {
    const resource = await Resource.findOne({
      where: {id: deal.resourceId}
    })

    if (!resource) {
      throw new Error("Resource not found for deal: " + deal.id + " with resource id: " + deal.resourceId)
    }

    const client = await Client.findOrCreate({
      where: {account: deal.client},
      defaults: {account: deal.client}
    })

    const provider = await Provider.findOrCreate({
      where: {account: deal.provider},
      defaults: {account: deal.provider}
    })

    const [instance, created] = await Deal.upsert({...deal, network: network}, {returning: true})

    await instance.setResource(resource)

    await instance.setClient(client[0])

    await instance.setProvider(provider[0])

    await instance.createMetadata({dealId: instance.dataValues.id, ...deal.metadata})

    await instance.createBandwidthLimit({dealId: instance.dataValues.id, ...deal.metadata.bandwidthLimit})

    for (const nodeLocation of deal.metadata.nodeLocations) {
      await instance.createNodeLocation({location: nodeLocation})
    }


    return {
      deal: instance.dataValues,
      created: created
    }
  }

  static async getDeals(
    dealFilter: WhereOptions<any> = {},
    metadataFilter: WhereOptions<any> = {},
    bandwidthFilter: WhereOptions<any> = {},
    nodeLocationFilter: WhereOptions<any> = {},
    page = 1,
    pageSize = 10
  ): Promise<Array<any>> {

    const offset = (page - 1) * pageSize

    const deals = await Deal.findAll({
      include: [
        {
          model: NodeLocation,
          attributes: ["location"],
          through: {
            attributes: []
          },
          where: nodeLocationFilter
        },

        {
          model: BandwidthLimit,
          as: "BandwidthLimit",
          where: bandwidthFilter
        },

        {
          model: DealMetadata,
          as: "Metadata",
          where: metadataFilter
        }
      ],
      where: dealFilter,
      offset: offset,
      limit: pageSize
    })

    const mappedDeals = deals.map((deal: Deal) => {
      return deal.toJSON()
    })

    return mappedDeals.map((deal) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      deal.NodeLocations = deal.NodeLocations.map((location: any) => location.location)
      return deal
    })
  }

  static async getDealById(id: string) {
    
    const deal = await Deal.findByPk(id)
    if (!deal) {
      return null
    }

    const metadata = await deal.getMetadata()
    const bandwidthLimit = await deal.getBandwidthLimit()
    const nodeLocations = await deal.getNodeLocations()

    return {
      deal: deal.dataValues,
      metadata: metadata.dataValues,
      bandwidthLimit: bandwidthLimit.dataValues,
      nodeLocations: nodeLocations.map((location: NodeLocation) => location.dataValues.location)
    }
  }

  static async deleteDealById(id: number) {
    const deal = await Deal.findByPk(id)
    if (!deal) {
      return null
    }
    await deal.destroy()
    return deal
  }

  static formatDeal(deal: any): DealFormatted {

    DealRawSchema.parse(deal)

    const transformed = this.transformObj(deal)

    transformed["metadata"] = JSON.parse(transformed.metadata)

    MetadataSchema.parse(transformed.metadata)

    return transformed as unknown as DealFormatted
  }

  private static transformObj(deal: any): DealTransformed {
    let result: any = {}

    // Iterate over the properties of the object
    for (const key in deal) {
      // If the property is an object, merge its properties with the result
      if (typeof deal[key] === "object" && deal[key] !== null) {
        result = {...result, ...this.transformObj(deal[key])}
      } else if (typeof deal[key] === "bigint") {
        // If the property is a bigint, parse it to a number
        result[key] = Number(deal[key])
      } else {
        // Otherwise, just copy the property to the result
        result[key] = deal[key]
      }
    }

    return result
  }
}