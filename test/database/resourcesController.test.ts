import {Resource} from "../../database/models/Resource"
import {ResourcesController} from "../../database/controllers/resourcesController"
import {resetSequelizeDB} from "../../database/utils"
import {Chain} from "../../database/models/Chain"
import {closeMongoDB, sequelize} from "../../database/database"

const mockResource = {
  id: 1n,
  owner: "DataTypes.STRING",
  encryptedData: "{\"encryptedData\": \"Some data encrypted\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
  encryptedSharedKey: "Some shared Key",
}

async function overPopulateDb(chainId: number) {
  for (let i = 0; i < 100; i++) {
    const mockResourceCopy = structuredClone(mockResource)
    mockResourceCopy.id = BigInt(i)
    const dealFormatted = ResourcesController.formatResource(mockResourceCopy)
    await ResourcesController.upsertResource(dealFormatted, chainId)
  }
}

beforeAll(async () => {
  await resetSequelizeDB()
  for (let i = 0; i < 5; i++) {
    await Chain.create({
      chainId: i,
      name: `Ganache ${i}`
    })
  }
})

afterAll(async () => {
  await sequelize.close()
  await closeMongoDB()
})

afterEach(async () => {
  await Resource.sync({force: true})
})

describe("Resource Controller", () => {
  test("Should create and then update a resource", async () => {
    const resource = {
      id: 1n,
      owner: "DataTypes.STRING",
      encryptedData: "{\"encryptedData\": \"Some data encrypted\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
      encryptedSharedKey: "Some shared Key",
    }

    const newResource = await ResourcesController.upsertResource(ResourcesController.formatResource(resource), 1)

    expect(newResource.instance.owner).toStrictEqual(resource.owner)

    // update resource and check if it was updated

    const updatedResourceData = {
      resourceId: 1,
      owner: "DataTypes.STRING",
      encryptedData: "{\"encryptedData\": \"Some data encrypted updated\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
      encryptedSharedKey: "Some shared Key"
    }

    const updatedResource = await ResourcesController.upsertResource(updatedResourceData, 1)

    expect(updatedResource.instance.encryptedData).toStrictEqual(updatedResourceData.encryptedData)
  })

  test("Should get a resource by id", async () => {
    const resource = {
      id: 1,
      owner: "DataTypes.STRING",
      encryptedData: "{\"encryptedData\": \"Some data encrypted\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
      encryptedSharedKey: "Some shared Key"
    }

    await ResourcesController.upsertResource(ResourcesController.formatResource(resource), 1)

    const foundResource = await ResourcesController.getResourceByIdAndChain(1, 1)
    
    expect(foundResource?.encryptedSharedKey).toStrictEqual(resource.encryptedSharedKey)
  })

  test("Should delete a resource by id", async () => {
    const resource = {
      id: 1,
      owner: "DataTypes.STRING",
      encryptedData: "{\"encryptedData\": \"Some data encrypted\", \"tag\": \"some tag\", \"iv\": \"some iv\"}",
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

  test("Get resources with no pagination retrieve all deals in db", async () => {

    await overPopulateDb(1)

    let resources = await ResourcesController.getResources()
    expect(resources.length).toBe(100)

    await overPopulateDb(2)

    resources = await ResourcesController.getResources()
    expect(resources.length).toBe(200)
  })

  test("Get resources with no pagination specifying chainId", async () => {
    await overPopulateDb(1)

    let resources = await ResourcesController.getResources(1)
    expect(resources.length).toBe(100)

    resources = await ResourcesController.getResources(2)
    expect(resources.length).toBe(0)
  })

  test("Get resources paginating", async () => {
    await overPopulateDb(1)

    let resources = await ResourcesController.getResources(undefined, {}, 1, 30 )
    expect(resources.length).toBe(30)
    expect(resources[0].id).toBe(1)
    expect(resources[14].id).toBe(15)
    expect(resources[29].id).toBe(30)

    resources = await ResourcesController.getResources(1, {}, 3, 30 )
    expect(resources.length).toBe(30)
    expect(resources[0].id).toBe(61)
    expect(resources[14].id).toBe(75)
    expect(resources[29].id).toBe(90)

    resources = await ResourcesController.getResources(3, {}, 3, 30 )
    expect(resources.length).toBe(0)
  })
})