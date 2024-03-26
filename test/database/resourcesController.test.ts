import {Resource} from "../../database/models/Resource"
import {ResourcesController} from "../../database/controllers/resourcesController"
import {sequelize} from "../../database/database"

beforeAll(async () => {
  await Resource.sync({force: true})
})

afterAll(async () => {
  await Resource.drop()
})

describe("Resource Controller", () => {
  test("should create or update a resource", async () => {
    const resource = {
      id: "1",
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key",
      network: "DataTypes.STRING",
    }

    const newResource = await ResourcesController.upsertResource(resource)

    expect(newResource.instance).toStrictEqual(resource)

    // update resource and check if it was updated

    const updatedResourceData = {
      id: "1",
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted updated",
      encryptedSharedKey: "Some shared Key",
      network: "DataTypes.STRING",
    }

    const updatedResource = await ResourcesController.upsertResource(updatedResourceData)

    expect(updatedResource.instance).toStrictEqual(updatedResourceData)
  })

  test("should get a resource by id", async () => {
    const resource = {
      id: 1,
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key",
      network: "DataTypes.STRING",
    }

    await ResourcesController.upsertResource(resource)

    const foundResource = await ResourcesController.getResourceById("1")
    
    expect(foundResource).toStrictEqual(resource)
  })

  test("should delete a resource by id", async () => {
    const resource = {
      id: "1",
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key",
      network: "DataTypes.STRING",
    }

    await ResourcesController.upsertResource(resource)

    await ResourcesController.deleteResourceById("1")

    const deletedResource = await ResourcesController.getResourceById("1")

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    expect(deletedResource).toBeNull()

    const foundResource = await ResourcesController.getResourceById("1")

    expect(foundResource).toBeNull()
  })

  test("pagination", async() => {
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < 20; i++) {
        await Resource.create({
          id: i.toString(),
          owner: "DataTypes.STRING",
          encryptedData: "Some data encrypted",
          encryptedSharedKey: "Some shared Key",
          network: "DataTypes.STRING",
        }, {transaction: t})
      }
    })

    const firstPageResources = await ResourcesController.getResources({}, 1, 10)

    expect(firstPageResources.length).toBe(10)
    
    expect(firstPageResources[0].id).toBe(0)

    const secondPageResources = await ResourcesController.getResources({}, 2, 10)

    expect(secondPageResources.length).toBe(10)
    
    expect(secondPageResources[0].id).toBe(10)
    
    expect(secondPageResources[9].id).toBe(19)
  })
})