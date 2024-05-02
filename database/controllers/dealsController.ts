import {Deal} from "../models/deals/Deal"
import {WhereOptions} from "sequelize"
import {DealFormatted, DealRawSchema, DealTransformed, MetadataSchema} from "../models/types/deal"
import {DealMetadata} from "../models/deals/DealsMetadata"
import {NodeLocation} from "../models/NodeLocation"
import {BandwidthLimit} from "../models/BandwidthLimit"
import {Chain} from "../models/Chain"
import {ResourcesController} from "./resourcesController"
import {Client} from "../models/Client"
import {ChainClient} from "../models/manyToMany/ChainClient"
import {ProvidersController} from "./providersController"
import {DealNodeLocation} from "../models/manyToMany/DealNodeLocation"

/**
 * DealsController class
 */
export class DealsController {

  /**
   * Upsert a deal
   * @param deal - The deal to be upserted
   * @param chainId - The network of the deal
   * @returns Promise<{deal: InferAttributes<Deal, {omit: never}>, created: boolean | null}>
   */
  static async upsertDeal(deal: DealFormatted, chainId: number) {
    // Find the resource for the deal
    const resource = await ResourcesController.getResourceByIdAndChain(deal.resourceId ? deal.resourceId : 0, chainId)
    
    deal["resourceId"] = resource?.id ? resource.id : null
    
    const chain = await Chain.findOne({
      where: {chainId: chainId},
    })
    
    if(!chain) {
      throw new Error("Chain does not exists")
    }
    
    // Upsert the client
    await Client.findOrCreate({
      where: {
        account: deal.client,
      },
      defaults: {
        account: deal.client,
      }
    })

    await ChainClient.findOrCreate({
      where: {
        chainId: chainId,
        client: deal.client
      },
      defaults: {
        chainId: chainId,
        client: deal.client
      }
    })
    
    // Upsert the provider
    await ProvidersController.upsertProvider(deal.provider, chainId, deal.client)

    // Upsert the deal
    const dealFromDb = await Deal.findOne({
      where: {
        dealId: deal.dealId,
        chainId: chainId
      }
    })
    
    const [instance, created] = await Deal.upsert({...deal, chainId: chainId, id: dealFromDb?.id})

    // Create metadata for the deal
    const metadata = await instance.createMetadata({dealId: instance.dataValues.id, ...deal.metadata})

    // Create bandwidth limit for the deal
    await metadata.createBandwidthLimit({dealMetadataId: metadata.dataValues.id, ...deal.metadata.bandwidthLimit})

    // Create node locations for the deal
    for (const nodeLocation of deal.metadata.nodeLocations) {
      await NodeLocation.findOrCreate({
        where: {
          location: nodeLocation
        },
        defaults: {
          location: nodeLocation
        }
      })

      await DealNodeLocation.findOrCreate({
        where: {
          dealId: instance.id,
          location: nodeLocation
        },

        defaults: {
          dealId: instance.id,
          location: nodeLocation
        }
      })
    }

    return {
      deal: instance.dataValues,
      created: created
    }
  }

  /**
   * Get deals
   * @param chainId - The chain id for the deal
   * @param dealFilter - Filter for the deals
   * @param metadataFilter - Filter for the metadata
   * @param bandwidthFilter - Filter for the bandwidth limit
   * @param nodeLocationFilter - Filter for the node locations
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Promise<Array<any>>
   */
  static async getDeals(
    chainId: number | undefined = undefined,
    dealFilter: WhereOptions<any> = {},
    metadataFilter: WhereOptions<any> = {},
    bandwidthFilter: WhereOptions<any> = {},
    nodeLocationFilter: WhereOptions<any> = {},
    page: number | undefined = undefined,
    pageSize: number | undefined= undefined
  ): Promise<Array<any>> {

    // Calculate the offset
    const offset = page && pageSize ? (page - 1) * pageSize : undefined

    // Find all deals with the given filters
    const deals = await Deal.findAll({
      include: [
        {
          model: Chain,
          required: !!chainId,
          where: {
            chainId: chainId ? chainId : null
          },
          attributes: [],
          as: "Chain"
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
          model: DealMetadata,
          as: "Metadata",
          where: metadataFilter,
          attributes: {
            exclude: ["id", "dealId"]
          },
          include: [
            {
              model: BandwidthLimit,
              as: "BandwidthLimit",
              where: bandwidthFilter,
              attributes: {
                exclude: ["dealMetadataId", "offerMetadataId", "id"]
              }
            },
          ]
        }
      ],
      where: dealFilter,
      offset: offset,
      limit: pageSize
    })

    // Map the deals to JSON
    const mappedDeals = deals.map((deal) => {
      return deal.toJSON()
    })

    // Get the node locations for each deal
    for (let i = 0; i < deals.length; i++) {
      mappedDeals[i].NodeLocations = await deals[i].getNodeLocations({attributes: ["location"]})
      mappedDeals[i].NodeLocations = mappedDeals[i].NodeLocations?.map((location: any) => location.location)
    }

    return mappedDeals
  }

  /**
   * Get deal by id
   * @param dealId - The id of the deal
   * @param chainId - The id of the chain where the deal is
   * @returns Promise<{deal: InferAttributes<Deal, {omit: never}>,metadata: InferAttributes<DealMetadata, {omit: never}>,bandwidthLimit: InferAttributes<BandwidthLimit, {omit: never}>,nodeLocations: Array<string>}>
   */
  static async getDealByIdAndChain(dealId: number, chainId: number) {

    // Find the deal by id
    const deal = await Deal.findOne({
      where: {
        dealId: dealId,
      },
      
      include: [
        {
          model: Chain,
          as: "Chain",
          where: {
            chainId: chainId
          }
        }
      ]
    })
    if (!deal) {
      return null
    }

    // Get the metadata for the deal
    const metadata = await deal.getMetadata()

    // Get the bandwidth limit for the deal
    const bandwidthLimit = await metadata.getBandwidthLimit()

    // Get the node locations for the deal
    const nodeLocations = await deal.getNodeLocations()

    return {
      deal: deal.dataValues,
      metadata: metadata.dataValues,
      bandwidthLimit: bandwidthLimit.dataValues,
      nodeLocations: nodeLocations.map((location: NodeLocation) => location.dataValues.location)
    }
  }

  /**
   * Delete deal by id
   * @param id - The id of the deal
   * @param chainId
   * @returns Promise<Deal | null>
   */
  static async deleteDealById(id: number, chainId: number) {

    // Find the deal by id
    const deal = await Deal.findOne({
      where: {
        dealId: id,
      },
      
      include: [
        {
          model: Chain,
          as: "Chain",
          where: {
            chainId: chainId
          }
        }
      ]
    })
    if (!deal) {
      return null
    }
    // Delete the deal
    await deal.destroy()
    return deal
  }

  /**
   * Format deal
   * @param deal - The deal to be formatted
   * @returns DealFormatted
   */
  static formatDeal(deal: any): DealFormatted {

    // Parse the raw schema of the deal
    DealRawSchema.parse(deal)

    // Transform the deal
    const transformed = this.transformObj(deal)

    // Parse the metadata of the deal
    transformed["metadata"] = JSON.parse(transformed.metadata)

    // Parse the metadata schema of the deal
    MetadataSchema.parse(transformed.metadata)

    return transformed as unknown as DealFormatted
  }

  /**
   * Transform object
   * @param deal - The deal to be transformed
   * @returns DealTransformed
   */
  private static transformObj(deal: any): DealTransformed {
    let result: any = {}

    // Iterate over the properties of the object
    for (const key in deal) {
      // If the key is "id", transform it to "dealId"
      if(key === "id") {
        result["dealId"] = Number(deal["id"])
      }
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
    
    delete result["id"]
    return result
  }
}