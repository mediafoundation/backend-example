import request from "supertest"
import express from "express"
import {validateChain} from "../../middlewares/validChain"
import {validateParams, ValidatorType} from "../../middlewares/validation"

const app = express()
app.use(express.json())
const validChains = [1, 2, 3]
app.post("/test", validateParams({chainId: [ValidatorType.NUMBER, ValidatorType.NUMBER_ARRAY]}), validateChain(validChains), (req, res) => res.status(200).send("OK"))

describe("validateChain middleware", () => {
  it("should call next if chainId is valid and a number", async () => {
    await request(app)
      .post("/test")
      .send({ chainId: 1 })
      .expect(200, "OK")
  })

  it("should call next if chainId is valid and an array", async () => {
    await request(app)
      .post("/test")
      .send({ chainId: JSON.stringify([1, 2]) })
      .expect(200, "OK")
  })

  it("should return 400 if chainId is invalid", async () => {
    await request(app)
      .post("/test")
      .send({ chainId: 4 })
      .expect(400, { errors: ["Chain ID \"4\" is not valid."] })
  })

  it("should return 400 if chainId is an invalid array", async () => {
    await request(app)
      .post("/test")
      .send({ chainId: JSON.stringify([1, 4]) })
      .expect(400, { errors: ["Chain ID \"4\" is not valid."] })
  })

  it("should return 400 if chainId is not a number or array", async () => {
    await request(app)
      .post("/test")
      .send({ chainId: "invalid" })
  })

  it("should return 400 if chainId is missing", async () => {
    await request(app)
      .post("/test")
      .send({})
  })
})