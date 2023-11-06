const Resource = require('./../models/resource');

const upsertResource = async (resource: any) => {
  try {
    const [instance, created] = await Resource.upsert(resource);
    return [instance, created];
  } catch (error) {
    throw error;
  }
};

const getResourceById = async (id: any) => {
  try {
    return await Resource.findByPk(id);
  } catch (error) {
    throw error;
  }
};

const deleteResourceById = async (id: any) => {
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

module.exports = {
  upsertResource,
  getResourceById,
  deleteResourceById
};