import {resetDB} from "../../database/utils"
import {ProvidersController} from "../../database/controllers/providersController"
import {Chain} from "../../database/models/Chain"
import {Provider} from "../../database/models/Provider"
import {ChainProvider} from "../../database/models/manyToMany/ChainProvider"

beforeAll(async () => {
  await resetDB()

  for (let i = 0; i < 2; i++) {
    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
  }
})

afterEach(async () => {
  await Provider.sync({force: true})
  await ChainProvider.sync({force: true})
})

describe("Providers Controller", () => {

  test("Upsert provider", async () => {
    let result = await ProvidersController.upsertProvider("Account 1", 1)

    expect(result.instance).not.toBeNull()
    expect(result.instance.account).toBe("Account 1")
    expect(result.created).toBe(true)

    result = await ProvidersController.upsertProvider("Account 1", 1)
    expect(result.instance).not.toBeNull()
    expect(result.instance.account).toBe("Account 1")
    expect(result.created).toBe(false)
  })

  test("Get provider by chainId", async () => {
    await ProvidersController.upsertProvider("Account 1", 1)
    await ProvidersController.upsertProvider("Account 1", 0)

    const result = await ProvidersController.getProviders({chainId: 1})
    expect(result.length).toBe(1)
  })

  test("Get all providers when no pagination given", async () => {
    for (let i = 0; i < 100; i++) {
      await ProvidersController.upsertProvider(`Account: ${i}`, 1)
    }

    const providers = await ProvidersController.getProviders()

    expect(providers.length).toStrictEqual(100)
    expect(providers[0].account).toStrictEqual("Account: 0")
    expect(providers[13].account).toStrictEqual("Account: 13")
    expect(providers[99].account).toStrictEqual("Account: 99")
  })

  test("Get providers paginating", async () => {
    for (let i = 0; i < 100; i++) {
      await ProvidersController.upsertProvider(`Account: ${i}`, 1)
    }

    const firstPageProviders = await ProvidersController.getProviders({chainId: 1}, 1, 20)

    expect(firstPageProviders.length).toStrictEqual(20)
    expect(firstPageProviders[0].account).toStrictEqual("Account: 0")
    expect(firstPageProviders[13].account).toStrictEqual("Account: 13")
    expect(firstPageProviders[19].account).toStrictEqual("Account: 19")

    const thirdPageProviders = await ProvidersController.getProviders({chainId: 1}, 3, 10)

    expect(thirdPageProviders.length).toStrictEqual(10)
    expect(thirdPageProviders[0].account).toStrictEqual("Account: 20")
    expect(thirdPageProviders[5].account).toStrictEqual("Account: 25")
    expect(thirdPageProviders[9].account).toStrictEqual("Account: 29")
  })
})