import {ResourcesController} from "../database/controllers/resourcesController"
import request from "supertest"
import {app, server} from "../api"
import {DealsController} from "../database/controllers/dealsController"

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
afterAll((done) => {
  server.close(done)
})
describe("Test api", () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  test("Get resources should respondCorrectly", async () => {
    (ResourcesController.getResources as jest.Mock).mockResolvedValue(["Test for Resource data"])
    const response = await request(app).get("/resources")
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Resource data"])
    expect(ResourcesController.getResources).toHaveBeenCalledWith()
  })
  
  test("Should respond with error if exception occurred", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    (ResourcesController.getResources as jest.Mock).mockRejectedValue(new Error("Something went wrong"))
    
    const response = await request(app).get("/resources")
    
    expect(response.status).toBe(500)
    expect(consoleSpy).toHaveBeenCalled()
  })
  
  test("Get deals should respond correctly", async () => {
    (DealsController.getDeals as jest.Mock).mockResolvedValue(["Test for Deal data"])
    
    // Get resources without any filter
    let response = await request(app).get("/deals").query({chainId: 1})
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Deal data"])
    expect(DealsController.getDeals).toHaveBeenCalledWith(1, {}, {}, {}, {}, 1, 10)
    
    const filter = JSON.stringify({
      nodeLocationFilter: {
        location: "US"
      }
    })
    
    // Get resources with nodeLocation filter
    response = await request(app).get("/deals").query({filters: filter, chainId: 1})
    expect(response.status).toBe(200)
    expect(response.body).toEqual(["Test for Deal data"])
    expect(DealsController.getDeals).toHaveBeenCalledWith(1, {}, {}, {}, {location: "US"}, 1, 10)
  })
})