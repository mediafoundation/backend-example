import {Resource} from '../models/Resource';
import {WhereOptions} from "sequelize";

export class ResourcesController {
  static upsertResource = async (resource: any) => {
    try {
      const originalResource = await Resource.findByPk(resource.id);
      const [instance, created] = await Resource.upsert(resource);
      return {
        instance: instance,
        created: created,
        originalResource: originalResource
      };
    } catch (error) {
      throw error;
    }
  };

  static getResources = async (filter: WhereOptions<any> = {}) => {
    try {
      return await Resource.findAll({attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}, where: filter});
    } catch (error) {
      throw error;
    }
  }

  static getResourceById = async (id: string) => {
    try {
      return await Resource.findByPk(id, {attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
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