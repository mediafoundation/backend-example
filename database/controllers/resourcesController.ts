import {Resource} from "../models/Resource"
import {Op, WhereOptions} from "sequelize"
import {EncryptedResourceData, FormattedResource} from "../models/types/resource"
import {Chain} from "../models/Chain"

/**
 * ResourcesController class
 */
export class ResourcesController {
  
  /**
   * Upsert a resource
   * @param resource - The resource to be upserted
   * @param chainId
   * @returns Promise<{instance: InferAttributes<Resource, {omit: never}>, created: boolean, originalResource: InferAttributes<Resource, {omit: never}> | null}>
   */
  static upsertResource = async (resource: FormattedResource, chainId: number) => {
    // Upsert the resource
    const resourceFromDb = await Resource.findOne({
      where: {
        resourceId: resource.resourceId,
        chainId: chainId
      }
    })
    
    const [instance, created] = await Resource.upsert({...resource, chainId: chainId, id: resourceFromDb?.id})
    
    return {
      instance: instance.dataValues,
      created: created
    }
  }
  
  /**
   * Get resources
   * @param chainId
   * @param filter - Filter for the resources
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Promise<Array<any>>
   */
  static getResources = async (
    chainId: number | number[] | undefined = undefined,
    filter: WhereOptions<any> = {},
    page: number | undefined = undefined,
    pageSize: number | undefined= undefined
  ) => {
    
    // Calculate the offset
    const offset = page && pageSize ? (page - 1) * pageSize : undefined

    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : {
      chainId: chainId ? chainId : null
    }

    // Find all resources with the given filter
    return await Resource.findAll({
      attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]},
      where: filter,
      include: [
        {
          model: Chain,
          required: !!chainId,
          where: chainIdFilter,
          attributes: [],
          as: "Chain"
        },
      ],
      offset: offset,
      limit: pageSize,
      raw: true
    })
  }
  
  /**
   * Get resource by id
   * @param resourceId - The id of the resource
   * @param chainId
   * @returns Promise<Resource | null>
   */
  static getResourceByIdAndChain = async (resourceId: number, chainId: number) => {
    // Find the resource by id
    return await Resource.findOne({
      where: {
        resourceId: resourceId,
        chainId: chainId
      },
      raw: true
    })
  }
  
  /**
   * Delete resource by id
   * @param id - The id of the resource
   * @returns Promise<Resource | null>
   */
  static deleteResourceById = async (id: any) => {
    
    // Find the resource by id
    const resource = await Resource.findByPk(id)
    if (!resource) {
      return null
    }
    
    // Delete the resource
    await resource.destroy()
    return resource
  }
  
  static formatResource = (resource: any): FormattedResource => {
    EncryptedResourceData.parse(JSON.parse(resource.encryptedData))
    
    return this.transformObj(resource)
  }
  
  private static transformObj = (resource: any): FormattedResource => {
    const result: any = {}
    
    for (const key in resource) {
      if(key === "id"){
        result["resourceId"] = Number(resource[key])
      }
      else {
        result[key] = resource[key]
      }
    }
    
    return result
  }
}