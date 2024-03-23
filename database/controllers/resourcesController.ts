import {Resource} from "../models/Resource"
import {WhereOptions} from "sequelize"

/**
 * ResourcesController class
 */
export class ResourcesController {
  
  /**
   * Upsert a resource
   * @param resource - The resource to be upserted
   * @returns Promise<{instance: InferAttributes<Resource, {omit: never}>, created: boolean, originalResource: InferAttributes<Resource, {omit: never}> | null}>
   */
  static upsertResource = async (resource: any) => {
    // Find the original resource
    const originalResource = await Resource.findByPk(resource.id)
    
    // Upsert the resource
    const [instance, created] = await Resource.upsert(resource)
    
    return {
      instance: instance.dataValues,
      created: created,
      originalResource: originalResource ? originalResource.dataValues : null
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
   * @param id - The id of the resource
   * @returns Promise<Resource | null>
   */
  static getResourceById = async (id: string) => {
    // Find the resource by id
    return await Resource.findByPk(id, {attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]}, raw: true})
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
}