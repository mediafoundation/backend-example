import {Resource} from "../../database/models/Resource";
import {ResourcesController} from "../../database/controllers/resourcesController"

beforeAll(async () => {
    await Resource.sync({force: true})
});

afterAll(async () => {
    await Resource.drop();
})

describe('Resource Controller', () => {
    test("should create or update a resource", async () => {
        const resource = {
            id: "1",
            owner: "DataTypes.STRING",
            label: "DataTypes.STRING",
            protocol: "DataTypes.STRING",
            origin: "DataTypes.STRING",
            path: "DataTypes.STRING",
            domain: "DataTypes.STRING",
            network: "DataTypes.STRING",
        };

        const newResource = await ResourcesController.upsertResource(resource)

        // @ts-ignore
        expect(newResource[0].dataValues).toStrictEqual(resource);

        // update resource and check if it was updated

        const updatedResourceData = {
            id: "1",
            owner: "DataTypes.STRING",
            label: "DataTypes.STRING",
            protocol: "My Protocol",
            origin: "DataTypes.STRING",
            path: "DataTypes.STRING",
            domain: "DataTypes.STRING",
            network: "DataTypes.STRING",
        };

        const updatedResource = await ResourcesController.upsertResource(updatedResourceData)

        // @ts-ignore
        expect(updatedResource[0].dataValues).toStrictEqual(updatedResourceData);
    })

    test("should get a resource by id", async () => {
        const resource = {
            id: "1",
            owner: "DataTypes.STRING",
            label: "DataTypes.STRING",
            protocol: "DataTypes.STRING",
            origin: "DataTypes.STRING",
            path: "DataTypes.STRING",
            domain: "DataTypes.STRING",
            network: "DataTypes.STRING",
        };

        await ResourcesController.upsertResource(resource)

        const foundResource = await ResourcesController.getResourceById("1")

        // @ts-ignore
        expect(foundResource.dataValues).toStrictEqual(resource);
    })

    test("should delete a resource by id", async () => {
        const resource = {
            id: "1",
            owner: "DataTypes.STRING",
            label: "DataTypes.STRING",
            protocol: "DataTypes.STRING",
            origin: "DataTypes.STRING",
            path: "DataTypes.STRING",
            domain: "DataTypes.STRING",
            network: "DataTypes.STRING",
        };

        await ResourcesController.upsertResource(resource)

        await ResourcesController.deleteResourceById("1")

        const deletedResource = await ResourcesController.getResourceById("1")

        // @ts-ignore
        expect(deletedResource).toBeNull();

        const foundResource = await ResourcesController.getResourceById("1")

        expect(foundResource).toBeNull()
    })
})