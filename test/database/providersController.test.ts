import {resetDB} from "../../database/utils"
import {Provider} from "../../database/models/Provider"
import {ProvidersController} from "../../database/controllers/providersController"
import {Chain} from "../../database/models/Chain"

beforeAll(async () => {
  await resetDB()

  for (let i = 0; i < 2; i++) {
    await Chain.create({
      chainId: i,
      name: `Chain name for ${i}`
    })
  }

  //Populate the db with several accounts
  for (let i = 0; i < 100; i++) {
    await Provider.create({account: `Account: ${i}`, chainId: 1})
  }
})

describe("Providers Controller", () => {
  test("Get all providers when no pagination given", async () => {
    const providers = await ProvidersController.getProviders()

    expect(providers.length).toStrictEqual(100)
    expect(providers[0].account).toStrictEqual("Account: 0")
    expect(providers[13].account).toStrictEqual("Account: 13")
    expect(providers[99].account).toStrictEqual("Account: 99")
  })

  test("Get providers paginating", async () => {
    const firstPageProviders = await ProvidersController.getProviders(1, 1, 20)

    expect(firstPageProviders.length).toStrictEqual(20)
    expect(firstPageProviders[0].account).toStrictEqual("Account: 0")
    expect(firstPageProviders[13].account).toStrictEqual("Account: 13")
    expect(firstPageProviders[19].account).toStrictEqual("Account: 19")

    const thirdPageProviders = await ProvidersController.getProviders(1, 3, 10)

    expect(thirdPageProviders.length).toStrictEqual(10)
    expect(thirdPageProviders[0].account).toStrictEqual("Account: 20")
    expect(thirdPageProviders[5].account).toStrictEqual("Account: 25")
    expect(thirdPageProviders[9].account).toStrictEqual("Account: 29")
  })
})