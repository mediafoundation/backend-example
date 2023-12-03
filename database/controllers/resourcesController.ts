import {Resource} from '../models/Resource';

export class ResourcesController {
  static upsertResource = async (resource: any) => {
    try {
      const [instance, created] = await Resource.upsert(resource);
      return [instance, created];
    } catch (error) {
      throw error;
    }
  };

  static getResources = async () => {
    try {
      return await Resource.findAll({attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
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