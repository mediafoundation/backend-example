import {Resource} from "../models/Resource"
import {WhereOptions} from "sequelize"

export class ResourcesController {
  static upsertResource = async (resource: any) => {
    const originalResource = await Resource.findByPk(resource.id)
    const [instance, created] = await Resource.upsert(resource)
    return {
      instance: instance.dataValues,
      created: created,
      originalResource: originalResource ? originalResource.dataValues : null
    }
  }

  static getResources = async (filter: WhereOptions<any> = {}, page = 1, pageSize = 10) => {
  
    const offset = (page - 1) * pageSize
    return await Resource.findAll({
      attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]},
      where: filter,
      offset: offset,
      limit: pageSize,
      raw: true
    })
  }


  static getResourceById = async (id: string) => {
    return await Resource.findByPk(id, {attributes: {exclude: ["createdAt", "updatedAt", "deletedAt"]}, raw: true})
  }

  static deleteResourceById = async (id: any) => {
    
    const resource = await Resource.findByPk(id)
    if (!resource) {
      return null
    }
    await resource.destroy()
    return resource
  }
}