import {Resource} from "../models/Resource"
import {WhereOptions} from "sequelize"
import {FormattedResource} from "../models/types/resource"

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
    // Find the original resource
    let created = false
    
    // Upsert the resource
    let instance = await Resource.findOne({
      where: {
        resourceId: resource.resourceId,
        chainId: chainId
      }
    })
    
    if(instance) {
      await instance.update(resource)
    } else {
      console.log(resource)
      instance = await Resource.create({...resource, chainId: chainId})
      created = true
    }
    
    return {
      instance: instance.dataValues,
      created: created
    }
  }
  
  /**
   * Get resources
   * @param filter - Filter for the resources
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Promise<Array<any>>
   */
  static getResources = async (filter: WhereOptions<any> = {}, page = 1, pageSize = 10) => {
    
    // Calculate the offset
    const offset = (page - 1) * pageSize
    
    // Find all resources with the given filter
    return await Resource.findAll({
      attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]},
      where: filter,
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