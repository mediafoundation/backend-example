import {Resource} from '../models/Resource';
import {WhereOptions} from "sequelize";

export class ResourcesController {
  static upsertResource = async (resource: any) => {
    try {
      const originalResource = await Resource.findByPk(resource.id);
      const [instance, created] = await Resource.upsert(resource);
      return {
        instance: instance.dataValues,
        created: created,
        originalResource: originalResource ? originalResource.dataValues : null
      };
    } catch (error) {
      throw error;
    }
  };

  static getResources = async (filter: WhereOptions<any> = {}, page = 1, pageSize = 10) => {
    try {
      const offset = (page - 1) * pageSize;
      return await Resource.findAll({
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
        where: filter,
        offset: offset,
        limit: pageSize,
        raw: true
      });
    } catch (error) {
      throw error;
    }
  }


  static getResourceById = async (id: string) => {
    try {
      return await Resource.findByPk(id, {attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}, raw: true});
    } catch (error) {
      throw error;
    }
  };

  static deleteResourceById = async (id: any) => {
    try {
      const resource = await Resource.findByPk(id);
      if (!resource) {
        return null;
      }
      await resource.destroy();
      return resource;
    } catch (error) {
      throw error;
    }
  };
}