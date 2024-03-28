import {Resource} from "../../database/models/Resource"
import {ResourcesController} from "../../database/controllers/resourcesController"
import {sequelize} from "../../database/database"
import {resetDB} from "../../database/utils"
import {Chain} from "../../database/models/Chain"

beforeAll(async () => {
  await resetDB()
  await Chain.create({
    chainId: 1,
    name: "Ganache"
  })
})

describe("Resource Controller", () => {
  test("should create or update a resource", async () => {
    const resource = {
      id: 1n,
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key",
    }

    const newResource = await ResourcesController.upsertResource(ResourcesController.formatResource(resource), 1)

    expect(newResource.instance.owner).toStrictEqual(resource.owner)
    expect(newResource.created).toBe(true)

    // update resource and check if it was updated

    const updatedResourceData = {
      resourceId: 1,
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted updated",
      encryptedSharedKey: "Some shared Key"
    }

    const updatedResource = await ResourcesController.upsertResource(updatedResourceData, 1)

    expect(updatedResource.instance.encryptedData).toStrictEqual(updatedResourceData.encryptedData)
    expect(updatedResource.created).toBe(false)
  })

  test("should get a resource by id", async () => {
    const resource = {
      id: 1,
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key"
    }

    await ResourcesController.upsertResource(ResourcesController.formatResource(resource), 1)

    const foundResource = await ResourcesController.getResourceByIdAndChain(1, 1)
    
    expect(foundResource?.encryptedSharedKey).toStrictEqual(resource.encryptedSharedKey)
  })

  test("should delete a resource by id", async () => {
    const resource = {
      id: 1,
      owner: "DataTypes.STRING",
      encryptedData: "Some data encrypted",
      encryptedSharedKey: "Some shared Key",
    }

    await ResourcesController.upsertResource(ResourcesController.formatResource(resource), 1)

    await ResourcesController.deleteResourceById("1")

    const deletedResource = await ResourcesController.getResourceByIdAndChain(1, 1)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    expect(deletedResource).toBeNull()

    const foundResource = await ResourcesController.getResourceByIdAndChain(1, 1)

    expect(foundResource).toBeNull()
  })

  test("pagination", async() => {
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < 20; i++) {
        await Resource.create({
          resourceId: i,
          owner: "DataTypes.STRING",
          encryptedData: "Some data encrypted",
          encryptedSharedKey: "Some shared Key",
          chainId: 1
        }, {transaction: t})
      }
    })

    const firstPageResources = await ResourcesController.getResources({}, 1, 10)

    expect(firstPageResources.length).toBe(10)
    
    expect(firstPageResources[0].resourceId).toBe(0)

    const secondPageResources = await ResourcesController.getResources({}, 2, 10)

    expect(secondPageResources.length).toBe(10)
    
    expect(secondPageResources[0].resourceId).toBe(10)
    
    expect(secondPageResources[9].resourceId).toBe(19)
  })
})