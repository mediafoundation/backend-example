import express from "express"
import request from "supertest"
import validateParams, {ValidatorType} from "../../middlewares/validation"

const testApi = express()

testApi.get("/test", validateParams({
  name: ValidatorType.STRING,
  age: ValidatorType.NUMBER,
  surname: ValidatorType.STRING_OPTIONAL,
  validationDays: ValidatorType.NUMBER_OPTIONAL
}), (req, res) => {
  const {name, age, surname} = req.query
  res.status(200).send(`Hello ${name}, you are ${age} years old and your surname is ${surname}`)
})

describe("Validation middleware", () => {
  it("should return 400 if a required parameter is missing", async () => {
    const response = await request(testApi).get("/test")
    expect(response.status).toBe(400)
  })

  it("should return 200 if all required parameters are present", async () => {
    const response = await request(testApi).get("/test").query({name: "John", age: 25})
    expect(response.status).toBe(200)
  })

  it("should return 200 if all required parameters are present and optional parameter is missing", async () => {
    const response = await request(testApi).get("/test?name=John&age=25")
    expect(response.status).toBe(200)
  })

  it("should return 200 if all required parameters are present and optional parameter is present", async () => {
    const response = await request(testApi).get("/test?name=John&age=25&surname=Doe")
    expect(response.status).toBe(200)
  })

  it("should return 400 if a required parameter is not a number", async () => {
    const response = await request(testApi).get("/test?name=John&age=twenty")
    expect(response.status).toBe(400)
  })
})