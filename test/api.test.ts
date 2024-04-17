import {ResourcesController} from "../database/controllers/resourcesController"
import request from "supertest"
import {app, server} from "../api"
import {DealsController} from "../database/controllers/dealsController"
import {OffersController} from "../database/controllers/offersController"
import {ProvidersController} from "../database/controllers/providersController"

jest.mock("../database/controllers/resourcesController", () => ({
  ResourcesController: {
    getResources: jest.fn()
  }
}))

jest.mock("../database/controllers/dealsController", () => ({
  DealsController: {
    getDeals: jest.fn()
  }
}))

jest.mock("../database/controllers/offersController", () => ({
  OffersController: {
    getOffers: jest.fn()
  }
}))

jest.mock("../database/controllers/providersController", () => ({
  ProvidersController: {
    getProviders: jest.fn()
  }
}))

afterAll((done) => {
  server.close(done)
})
describe("Test api", () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  test("Get resources should respondCorrectly", async () => {
    (ResourcesController.getResources as jest.Mock).mockResolvedValue(["Test for Resource data"])
    const response = await request(app).get("/resources").query({chainId: 1})
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Resource data"])
    expect(ResourcesController.getResources).toHaveBeenCalledWith(1)
  })
  
  test("Should respond with error if exception occurred", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    (ResourcesController.getResources as jest.Mock).mockRejectedValue(new Error("Something went wrong"))
    
    const response = await request(app).get("/resources").query({chainId: 1})
    
    expect(response.status).toBe(500)
    expect(consoleSpy).toHaveBeenCalled()
  })
  
  test("Get deals should respond correctly", async () => {
    (DealsController.getDeals as jest.Mock).mockResolvedValue(["Test for Deal data"])
    
    // Get resources without any filter
    let response = await request(app).get("/deals").query({chainId: 1})
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Deal data"])
    expect(DealsController.getDeals).toHaveBeenCalledWith(1, {}, {}, {}, {}, undefined, undefined)
    
    const filter = JSON.stringify({
      nodeLocationFilter: {
        location: "US"
      }
    })
    
    // Get resources with nodeLocation filter
    response = await request(app).get("/deals").query({filters: filter, chainId: 1})
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Deal data"])
    expect(DealsController.getDeals).toHaveBeenCalledWith(1, {}, {}, {}, {location: "US"}, undefined, undefined)
  })
  
  test("Get deals should respond with error if exception occurred", async () => {
    
    (DealsController.getDeals as jest.Mock).mockRejectedValue(new Error("Something went wrong"))
    const consoleSpy = jest.spyOn(console, "log")
    const response = await request(app).get("/deals").query({chainId: 1})
    
    expect(response.status).toBe(500)
    expect(consoleSpy).toHaveBeenCalled()
  })
  
  test("Get offers should respond correctly", async () => {
    (OffersController.getOffers as jest.Mock).mockResolvedValue(["Test for Offer data"])
    
    const response = await request(app).get("/offers").query({chainId: 1})
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Offer data"])
    expect(OffersController.getOffers).toHaveBeenCalledWith(1, {}, {}, {}, {}, undefined, undefined)
  })
  
  test("Get offers should respond with error if exception occurred", async () => {
    (OffersController.getOffers as jest.Mock).mockRejectedValue(new Error("Something went wrong"))
    
    const consoleSpy = jest.spyOn(console, "log")
    
    const response = await request(app).get("/offers").query({chainId: 1})
    expect(response.status).toEqual(500)
    expect(consoleSpy).toHaveBeenCalled()
  })

  test("Get providers should respond correctly", async () => {
    (ProvidersController.getProviders as jest.Mock).mockResolvedValue(["1", "2", "3"])

    let response = await request(app).get("/providers")
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["1", "2", "3"])
    expect(ProvidersController.getProviders).toHaveBeenCalledWith(undefined, undefined)

    response = await request(app).get("/providers").query({page: 1, pageSize: 10})
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["1", "2", "3"])
    expect(ProvidersController.getProviders).toHaveBeenCalledWith(1, 10)
  })
})